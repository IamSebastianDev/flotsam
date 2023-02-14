/** @format */

import { __root, safeAsyncAbort, isTruthy, sortByProperty, isDocument, FlotsamValidationError } from '../../utils';
import { Flotsam } from './Flotsam';
import { readdir, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { existsSync, unwatchFile } from 'node:fs';
import { ObjectId } from './ObjectId';
import { JSONDocument } from './JSONDocument';
import { resolve } from 'node:path';
import { Queue } from './Queue';
import type {
    Document,
    Rejector,
    FindOptions,
    FindByProperty,
    DocumentInit,
    Validator,
    ObservedQuery,
} from '../../types';
import { evaluateFindOptions } from './evaluateFindOptions';
import { Crypto } from './Crypto';
import { FlotsamError } from '../../utils/Errors/FlotsamError';
import { Observable } from './Observable';

/**
 * @Class
 * The `Collection` class is used to interface between a `Fløtsam` instance and it's `Documents`.
 * A `Collection` is created when executing the `collect()` method on a `Fløtsam` instance with a given namespace.
 * As a namespace is directly tied to it's physical counterpart, instancing a existing `Collection` via
 * the `collect()` method will return the cached `Collection`.
 *
 * ```ts
 * const collection = await db.collect('<namespace>')
 *
 * // any collection will accept a generic as argument,
 * // enabling strict type checks in subsequent methods
 * const users = await db.collect<{ name: string }>('users')
 * ```
 *
 * The created `Collection` is used to insert, find, update and delete `Documents`, that are contained
 * within the `Collection`. There are different methods available for each operation.
 *
 * - Inserting a `Document`
 *
 * This will create the `Document` and place it inside the `Collection`'s cache as well
 * as the physical storage location. If encryption is enabled, the `Document` will be encrypted
 * before being physically placed. If a `Document` is passed to the method instead of a
 * data Object, the `Document` will be upserted if it already exists.
 *
 * ```ts
 * const doc = await users.insertOne({name: 'Flotsam'})
 * // logs { name: 'Flotsam', _id: ObjectId }
 * ```
 *
 * - Finding a `Document`
 *
 * A `Document` can be searched for and found by each of it's properties by creating a
 * corresponding `FindOptions` object. Methods exist to select a `Document` inside the
 * Collection by it's Id or just it's properties without specifying pagination or ordering
 * parameters.
 *
 * ```ts
 * const doc = await users.findOneBy({ name: 'Flotsam' });
 * // logs { name: 'Flotsam', _id: ObjectId }
 * ```
 *
 * - Updating a `Document`
 *
 * A `Document` can be updated by providing a `FindOptions` object to identify the `Document` to
 * update as well as a object containing the properties to update.
 *
 * ```ts
 * const doc = await users.updateOne({ where: { name: 'Flotsam' } }, { name: 'Jetsam' });
 * // logs { name: 'Jetsam', _id: ObjectId }
 * ```
 *
 * - Deleting a `Document`
 *
 * Deleting a `Document` will remove it from the `Collection`s cache as well from it's physical
 * storage location.
 *
 * ```ts
 * let doc = await users.deleteOne({ where: { name: 'Flotsam' }})
 * // logs false
 * doc = await users.deleteOne({where: { name: 'Jetsam' }})
 * // logs { name: 'Jetsam', _id: ObjectId }
 * ```
 *
 * A `Collection` should not be instanced directly. If a `Collection` instance is
 * created, a `Flotsam` instance needs to be passed as well as the namespace.
 */

export class Collection<T extends Record<PropertyKey, unknown>> {
    #dir: string;
    #files: string[] = [];
    #documents: Map<string, JSONDocument<T>> = new Map();
    #queue: Queue = new Queue();
    #crypt: Crypto | null = null;
    #observedQueries: Array<ObservedQuery<T>> = [];
    constructor(private ctx: Flotsam, private namespace: string, private validationStrategy?: Validator<T>) {
        this.#dir = resolve(ctx.root, this.namespace);
        this.#crypt = ctx.auth ? new Crypto(ctx.auth) : null;

        process.on('SIGINT', async () => {
            await this.serialize();
        });

        process.on('SIGTERM', async () => {
            await this.serialize();
        });
    }

    async observe(observedFindOptions: FindOptions<T>): Promise<Observable<Document<T>[]>> {
        const initialQueryValue = await this.getEntriesByFindOptions({ ...observedFindOptions });

        const queryId = new ObjectId();
        const queryObserver = new Observable(initialQueryValue);
        queryObserver.onComplete(() => {
            this.#observedQueries.slice(
                this.#observedQueries.findIndex((queryObserver) => ObjectId.compare(queryId, queryObserver.queryId)),
                1
            );
        });

        this.#observedQueries.push({
            queryId,
            queryObserver,
            findOptions: observedFindOptions,
        });

        return queryObserver;
    }

    /**
     * @type { Promise<number> }
     * @description
     * @readonly
     * Returns the number of `Documents` currently stored in the collection.
     */

    get count(): Promise<number> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                res([...this.#documents.values()].length);
            })
        );
    }

    /**
     * @type { Promise<Document[]> }
     * @readonly
     * @description
     * Returns a copy of all `Documents` stored in the collection.
     */

    get entries(): Promise<Array<Document<T>>> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                res([...this.#documents.values()].map((doc) => ({ ...doc.toDoc() })));
            })
        );
    }

    /**
     * @private
     * @method
     * @description
     * Private method to create a rejector by binding a `Promise` rejection context to a function.
     *
     * @param { Rejector } reject - the `reject` function of a `Promise`
     * @returns { Rejector } a function to reject and emit errors
     */

    private rejector(reject: Rejector): Rejector {
        return (error: unknown) => {
            if (FlotsamError.is(error)) {
                if (!FlotsamError.current(error)) {
                    if (error.rethrows) {
                        reject(error);
                    }
                    return;
                }

                error.reported = true;
            }

            this.ctx.emit('error', (error as Error).message);
            reject(error);
        };
    }

    /**
     * @private
     * @description
     * A custom TypeGuard to assert if an object is a Document.
     *
     * @param { unknown } doc
     * @returns { boolean }
     */

    private checkDocumentValidity(doc: unknown): doc is DocumentInit<T> {
        return doc !== undefined && doc !== null && typeof doc === 'object' && '_id' in doc && '_' in doc;
    }

    /**
     * @public
     * @method
     * @description
     * Method used to deserialize the collection. This will load all records
     * stored in the namespaced folder into the internal cache.
     *
     * @returns { Promise<boolean> } true if the deserialization is successful
     */

    async deserialize(): Promise<boolean> {
        return this.#queue.enqueue(
            new Promise(async (res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    if (!existsSync(this.#dir)) {
                        await mkdir(this.#dir);
                    }

                    this.#files = (await readdir(this.#dir)).filter((file) => ObjectId.is(file));
                    const result = await Promise.all(
                        this.#files.map(async (document) => {
                            let content = await readFile(resolve(this.#dir, document), 'utf-8');

                            if (this.#crypt) content = this.#crypt.decrypt(content);
                            const doc: DocumentInit<T> = JSON.parse(content);

                            if (!this.checkDocumentValidity(doc)) {
                                return false;
                            }

                            this.#documents.set(
                                ObjectId.from(doc._id || document).str,
                                new JSONDocument<T>({ _id: document, _: doc._ }, this.validationStrategy)
                            );

                            return true;
                        })
                    );

                    if (result.some((val) => !val)) {
                        this.ctx.emit(
                            'error',
                            `Error during deserialization. Some Documents might be corrupted or encrypted with a different authorization key.`
                        );
                    }

                    this.ctx.emit('deserialize', this);
                    res(true);
                });
            })
        );
    }

    /**
     * @public
     * @method
     * @description
     * Method used to serialize the collection. This will store all objects in the
     * internal cache as record in the namespaced folder.
     *
     * @returns { Promise<boolean> } true if the serialization is successful
     */

    async serialize(): Promise<boolean> {
        return this.#queue.enqueue(
            new Promise(async (res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    if (!existsSync(this.#dir)) {
                        await mkdir(this.#dir);
                    }

                    await Promise.all(
                        [...this.#documents.entries()].map(async ([id, document]) => {
                            const path = resolve(this.#dir, id);
                            let content = document.toFile();
                            if (this.#crypt) content = this.#crypt.encrypt(content);

                            await writeFile(path, content, 'utf-8');
                        })
                    );

                    this.ctx.emit('serialize', this);
                    res(true);
                });
            })
        );
    }

    /**
     * @public
     * @method
     * @description
     * Drops the collection and removes all physical `Documents` stored on disk.
     *
     * @returns { Promise<boolean> } true if the collection was successfully dropped
     */

    async jettison(): Promise<boolean> {
        return this.#queue.enqueue(
            new Promise(async (res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    await rm(this.#dir, { recursive: true, force: true });
                    this.ctx.emit('drop', this);

                    res(true);
                });
            })
        );
    }

    private processEntries(findOptions: FindOptions<T>) {
        let items = [...this.#documents.entries()]
            .slice(0, findOptions.limit)
            .filter(([, value]) => evaluateFindOptions(value.toDoc(), findOptions))
            .map(([, doc]) => doc.toDoc());

        if (findOptions.order) {
            const { by, property } = findOptions.order;
            if (by && property) items.sort(sortByProperty(property, by));
        }

        if (findOptions.skip) {
            items = items.slice(findOptions.skip, -1);
        }

        if (findOptions.take) {
            items.length = findOptions.take;
        }

        return items;
    }

    //@Insert Operations

    /**
     * @private
     * @description
     * Private method to insert a `Document` into the `Collection` and it's physical
     * storage location
     *
     * @param { JSONDocument } document
     * @returns { Promise<boolean> }
     */

    private async insert(document: JSONDocument<T>): Promise<boolean> {
        return this.#queue.enqueue(
            new Promise(async (res, rej) => {
                let content = document.toFile();
                if (this.#crypt) content = this.#crypt.encrypt(content);

                const path = resolve(this.#dir, document._id.str);
                await writeFile(path, content, 'utf-8');

                this.#documents.set(document._id.str, document);

                this.ctx.emit('insert', document.toDoc());

                this.#observedQueries.forEach(({ queryObserver, findOptions }) => {
                    const foundDocs = [document]
                        .map((doc) => doc.toDoc())
                        .filter((doc) => evaluateFindOptions(doc, findOptions));

                    if (foundDocs.length > 0) {
                        queryObserver.next(this.processEntries(findOptions));
                    }
                });

                return res(true);
            })
        );
    }

    /**
     * @description
     * Method to insert data or a `Document` into the `Collection`. If a `Document` is given
     * that already exists, the `Document` is upserted.
     *
     * ---
     *
     *@example
     * ```ts
     * import { Flotsam } from "flotsam";
     *
     * const collection = await db.collect<{ name: string }>('collection')
     *
     * // Insert a document
     * const result = await collection.insertOne({ name: 'Flotsam' });
     * ```
     * ---
     *
     * @param { Record<string, unknown> } data - the data to insert.
     * @returns { Promise<Document | false> } the inserted `Document` or false, if the operation failed.
     */

    async insertOne(data: T | Document<T>): Promise<Document<T> | false> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    let doc, upsert;
                    if (isDocument(data)) {
                        doc = new JSONDocument({ _id: data.id, _: data }, this.validationStrategy);
                        upsert = true;
                    } else {
                        doc = new JSONDocument({ _: data }, this.validationStrategy);
                    }

                    const inserted = await this.insert(doc);

                    if (inserted && upsert) this.ctx.emit('upsert', doc.toDoc());
                    res(inserted ? doc.toDoc() : false);
                });
            })
        );
    }

    /**
     * @description
     * Method to insert multiple sets of data or `Documents` into the `Collection`. If any `Document` is given
     * that already exists, that `Document` is upserted.
     *
     * ---
     *
     *@example
     * ```ts
     * import { Flotsam } from "flotsam";
     *
     * const collection = await db.collect<{ name: string }>('collection')
     *
     * // Insert a document
     * const result = await collection.insertMany({ name: 'Flotsam' }, {name: 'Jetsam'});
     * ```
     * ---
     *
     * @param { Record<string, unknown>[] } data - the data to insert.
     * @returns { Promise<Document | false> } the inserted `Documents` or false, if the operation failed.
     */

    async insertMany(...data: T[]): Promise<Document<T>[] | false> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    const docs = data.map((doc) => new JSONDocument({ _: doc }), this.validationStrategy);
                    const success = await Promise.all(
                        data.map(async (data) => {
                            let doc, upsert;
                            if (isDocument(data)) {
                                doc = new JSONDocument({ _id: data._id.str, _: data }, this.validationStrategy);
                                upsert = true;
                            } else {
                                doc = new JSONDocument({ _: data }, this.validationStrategy);
                            }
                            const inserted = await this.insert(doc);

                            if (inserted && upsert) this.ctx.emit('upsert', doc.toDoc);
                            return inserted;
                        })
                    );

                    res(success.every(isTruthy) ? docs.map((doc) => doc.toDoc()) : false);
                });
            })
        );
    }

    // @Delete Operations

    /**
     * @private
     * @description
     * Private method to delete a `Document` from it's physical storage location
     * as well as from the `Collection`'s cache. The `Document` is identified
     * by it's id.
     *
     * @param { string } id - the given id of the `Document`
     * @returns { boolean }
     */

    private async delete(id: string): Promise<boolean> {
        return new Promise((res, rej) => {
            return safeAsyncAbort(this.rejector(rej), async () => {
                this.#documents.delete(id);
                await rm(resolve(this.#dir, id));
                this.ctx.emit('delete');
                res(true);
            });
        });
    }

    /**
     * @description
     * Collection method to delete a `Document` by it's Id.
     *
     * ---
     *
     *@example
     * ```ts
     * import { Flotsam } from "flotsam";
     *
     * const collection = await db.collect<{ name: string }>('collection')
     *
     * // Find the document with the given Id
     * const result = await collection.deleteOneById(<id>);
     * ```
     * ---
     *
     * @param { string } id - the id of the `Document` to delete
     * @returns {Promise<Document | null>} the first found `Document` or false if the operation failed
     */

    async deleteOneById(id: string): Promise<Document<T> | false> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    const item = [...this.#documents.entries()].find(([key]) =>
                        ObjectId.compare(ObjectId.from(key), ObjectId.from(id))
                    );

                    if (item === undefined) {
                        return res(false);
                    }

                    const deleted = await this.delete(item[0]);

                    return res(deleted ? item[1].toDoc() : false);
                });
            })
        );
    }

    /**
     * @description
     * Method to delete the first found `Document` by a given set of find options. Returns the deleted `Document`
     * or false, if no `Document` was found.
     *
     * ---
     *
     *@example
     * ```ts
     * import { Flotsam } from "flotsam";
     * import { Like } from "flotsam/evaluator"
     *
     * const collection = await db.collect<{ name: string }>('collection')
     *
     * // Search for the first Document containing a `name` property including 'flotsam'
     * const result = await collection.deleteOne({ where: {name: Like('flotsam') }});
     * ```
     * ---
     *
     * @param { FindOptions } findOptions - the find options to the find the `Document` by.
     * @returns { Promise<Document | false> } the deleted `Document` or false, if no `Document` was found.
     */

    async deleteOne(findOptions: FindOptions<T>): Promise<Document<T> | false> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    const items = await this.getEntriesByFindOptions(findOptions);

                    if (items[0] === undefined) {
                        return res(false);
                    }

                    const deleted = await this.delete(items[0].id);

                    return res(deleted ? items[0] : false);
                });
            })
        );
    }

    /**
     * @description
     * Method to delete the first found `Document` by a given set of simplified findByProperty options.
     * Returns the deleted `Document` or false, if no `Document` was found.
     *
     * ---
     *
     *@example
     * ```ts
     * import { Flotsam } from "flotsam";
     * import { Like } from "flotsam/evaluator"
     *
     * const collection = await db.collect<{ name: string }>('collection')
     *
     * // Search for the first Document containing a `name` property including 'flotsam'
     * const result = await collection.deleteOneBy({name: Like('flotsam') });
     * ```
     * ---
     *
     * @param { FindByProperty } findOptions - the find options to find the `Document` by.
     * @returns { Promise<Document | false> } the deleted `Document` or false, if no `Document` was found.
     */

    async deleteOneBy(findOptions: FindByProperty<T>): Promise<Document<T> | false> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    const items = await this.getEntriesByFindOptions({ where: findOptions });

                    if (items[0] === undefined) {
                        return res(false);
                    }

                    const deleted = await this.delete(items[0].id);

                    return res(deleted ? items[0] : false);
                });
            })
        );
    }

    /**
     * @description
     * Collection method to delete a number of `Documents` according to the given `FindOptions`.
     *
     * ---
     *
     *@example
     * ```ts
     * import { Flotsam } from "flotsam";
     * import { Like } from "flotsam/evaluator"
     *
     * const collection = await db.collect<{ name: string }>('collection')
     *
     * // Search for any number of Documents containing a `name` property including 'flotsam'
     * // and delete them
     * const result = await collection.deleteMany({ where: {name: Like('flotsam') }});
     * ```
     *
     * The full set of `FindOptions` applies, meaning the results can filtered, limited, skipped and orderer
     * before executing the delete operation.
     *
     * ---
     *
     * @param { FindOptions } findOptions - the given FindOptions to select `Documents` by.
     * @returns { Promise<Document[] | false> } an Array of Documents or false if the operation failed.
     */

    async deleteMany(findOptions: FindOptions<T>): Promise<Document<T>[] | false> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    const items = await this.getEntriesByFindOptions(findOptions);

                    if (items.length === 0) {
                        return res(false);
                    }

                    const deleted = await Promise.all(items.map(async (item) => this.delete(item.id)));

                    return res(deleted.every(isTruthy) ? items : false);
                });
            })
        );
    }

    //@Find Operations

    /**
     * @private
     * @description
     *
     * Private method to retrieve a array of `Document` from the collection that satisfy the given
     * `FindOptions`.
     *
     * @param findOptions
     * @returns
     */

    private async getEntriesByFindOptions(findOptions: FindOptions<T>): Promise<Document<T>[]> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    res(this.processEntries(findOptions));
                });
            })
        );
    }

    /**
     * @description
     * Collection method to select a `Document` by it's Id.
     *
     * ---
     *
     *@example
     * ```ts
     * import { Flotsam } from "flotsam";
     *
     * const collection = await db.collect<{ name: string }>('collection')
     *
     * // Find the document with the given Id
     * const result = await collection.findOneById(<id>);
     * ```
     * ---
     *
     * @param { string } id - the id of the `Document` to select
     * @returns {Promise<Document | null>} the first found `Document` or null if none was found
     */

    async findOneById(id: string): Promise<Document<T> | null> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    const item = [...this.#documents.entries()].find(([key]) =>
                        ObjectId.compare(ObjectId.from(key), ObjectId.from(id))
                    );

                    if (item === undefined) {
                        return res(null);
                    }

                    return res(item[1].toDoc());
                });
            })
        );
    }

    /**
     * @description
     * Method to select a `Document` according to the given `FindOptions`.
     * Returns the `Document` or `null` if no result was found.
     *
     * ---
     *
     *@example
     * ```ts
     * import { Flotsam } from "flotsam";
     * import { Like } from "flotsam/evaluator"
     *
     * const collection = await db.collect<{ name: string }>('collection')
     *
     * // Search for the first Document containing a `name` property including 'flotsam'
     * const result = await collection.findOne({ where: {name: Like('flotsam') }});
     * ```
     * ---
     *
     * @param { FindOptions } findOptions - the given FindOptions to select `Documents` by.
     * @returns { Promise<Document[]> } an Array of Documents.
     */

    async findOne(findOptions: FindOptions<T>): Promise<Document<T> | null> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    const item = await this.getEntriesByFindOptions(findOptions);

                    if (item[0] === undefined) {
                        return res(null);
                    }

                    return res(item[0]);
                });
            })
        );
    }

    /**
     * @description
     * Collection method to select the first `Document` according to the given simplified find by property options.
     *
     * -----
     *
     *@example
     * ```ts
     * import { Flotsam } from "flotsam";
     * import { Like } from "flotsam/evaluator"
     *
     * const collection = await db.collect<{ name: string }>('collection')
     *
     * // Search for the first Document containing a `name` property including 'flotsam'
     * const result = await collection.findOneBy({name: Like('flotsam')});
     * ```
     * ---
     *
     * @param { FindByProperty } findOptions - the given simplified FindByProperty options to select `Documents` by.
     * @returns { Promise<Document> } an Array of Documents.
     */

    async findOneBy(findOptions: FindByProperty<T>): Promise<Document<T> | null> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    const item = await this.getEntriesByFindOptions({ where: findOptions });

                    if (item[0] === undefined) {
                        return res(null);
                    }

                    return res(item[0]);
                });
            })
        );
    }

    /**
     * @description
     * Collection method to select a number of `Documents` according to the given find options.
     *
     * -----
     *
     *@example
     * ```ts
     * import { Flotsam } from "flotsam";
     * import { Like } from "flotsam/evaluator"
     *
     * const collection = await db.collect<{ name: string }>('collection')
     *
     * // Search for any number of Documents containing a `name` property including 'flotsam'
     * const result = await collection.findMany({ where: {name: Like('flotsam') }});
     * ```
     *
     * Results can be ordered by any property present in the `Document`.
     *
     * ```ts
     * // Perform the same search, but order the `Documents` by their first character.
     * const result = await collection.findMany({ where : { name: Like('flotsam') }, order: { by: 'name', order: 'ASC' }})
     *```
     *
     * Results can also be paginated, by skipping and taking. Skip and take can both be used independent of each other.
     *
     * ```ts
     * // Perform the same search, but skip the first ten `Documents` found, and only take ten results
     * const result = await collection.findMany({ where: { name: Like('flotsam') }, skip: 10, take: 10 })
     * ```
     *
     * Results can be limited. Any limit will be applied after taking and skipping.
     *
     * ```ts
     * // Perform the same search, but return only 100 `Documents`, if found more.
     * const result = await collection.findMany({ where: { name: Like('flotsam') }, limit: 100 })
     * ```
     * ---
     *
     * @param { FindOptions } findOptions - the given FindOptions to select `Documents` by.
     * @returns { Promise<Document[]> } an Array of Documents.
     */

    async findMany(findOptions: FindOptions<T>): Promise<Document<T>[]> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    return res(await this.getEntriesByFindOptions(findOptions));
                });
            })
        );
    }

    /**
     * @description
     * Collection method to select a number of `Documents` according to the given simplified find by property options.
     * The `findManyBy` method does not support ordering, taking, skipping or limiting the results.
     *
     * -----
     *
     *@example
     * ```ts
     * import { Flotsam } from "flotsam";
     * import { Like } from "flotsam/evaluator"
     *
     * const collection = await db.collect<{ name: string }>('collection')
     *
     * // Search for any number of Documents containing a `name` property including 'flotsam'
     * const result = await collection.findManyBy({name: Like('flotsam')});
     * ```
     * ---
     *
     * @param { FindByProperty } findOptions - the given simplified FindByProperty options to select `Documents` by.
     * @returns { Promise<Document[]> } an Array of Documents.
     */

    async findManyBy(findOptions: FindByProperty<T>): Promise<Document<T>[]> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    return res(await this.getEntriesByFindOptions({ where: findOptions }));
                });
            })
        );
    }

    //@Update Operations

    /**
     * @private
     * @description
     * Internal method to update a `Document`
     *
     * @param { Document } document - the found Document to update
     * @param { Partial<any> } data - the data to update the document with
     *
     * @returns { Promise<Document> }
     */

    private async update(document: Document<T>, data: Partial<T>): Promise<Document<T>> {
        return new Promise((res, rej) => {
            return safeAsyncAbort(this.rejector(rej), async () => {
                const updated = new JSONDocument(
                    { _id: document.id, _: { ...document, ...data } },
                    this.validationStrategy
                );

                let content = updated.toFile();
                if (this.#crypt) content = this.#crypt.encrypt(content);

                await writeFile(resolve(this.#dir, document.id), content, 'utf8');
                this.#documents.set(document.id, updated);

                this.#observedQueries.forEach(({ queryObserver, findOptions }) => {
                    const foundDocs = [document].filter((doc) => evaluateFindOptions(doc, findOptions));

                    if (foundDocs.length > 0) {
                        queryObserver.next(this.processEntries(findOptions));
                    }
                });

                return res(updated.toDoc());
            });
        });
    }

    /**
     * @description
     * Collection method to select a `Document` from the collection by it's Id and update it with
     * the newly given Data.
     *
     * -----
     *
     *@example
     * ```ts
     * import { Flotsam } from "flotsam";
     *
     * const collection = await db.collect<{ name: string }>('collection')
     *
     * // Update the document with the given Id
     * const result = await collection.updateOneById(<id>, { name: 'jetsam' });
     * ```
     * ---
     *
     * @param { string } id - the string to find the `Document` by.
     * @param { Record<string, unknown> } data - the data to update the `Document` with.
     * @returns { Promise<Document | false> } a Promise containing the updated `Document`
     * or false, indicating that no `Document was found`.
     */

    async updateOneById(id: string, data: Partial<T>): Promise<Document<T> | false> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    const item = [...this.#documents.entries()].find(([key]) =>
                        ObjectId.compare(ObjectId.from(key), ObjectId.from(id))
                    );

                    if (item === undefined) {
                        return res(false);
                    }

                    const updated = await this.update(item[1].toDoc(), data);
                    if (updated) this.ctx.emit('update');

                    return res(updated);
                });
            })
        );
    }

    /**
     * @description
     * Collection method to select the first `Document` from the collection that satisfies a given set
     * of find options and update it with the given data.
     *
     * -----
     *
     *@example
     * ```ts
     * import { Flotsam } from "flotsam";
     * import { Like } from "flotsam/evaluator"
     *
     * const collection = await db.collect<{ name: string }>('collection')
     *
     * // Update the first document satisfying the given find options
     * const result = await collection.updateOne({ where: {name: Like('flotsam') }}, { name: 'jetsam' });
     * ```
     * ---
     *
     * @param { FindOptions } findOptions - the find options to find the `Document` by.
     * @param { Record<string, unknown> } data - the data to update the `Document` with.
     * @returns { Promise<Document | false> } a Promise containing the updated `Document`
     * or false, indicating that no `Document was found`.
     */

    async updateOne(findOptions: FindOptions<T>, data: Partial<T>): Promise<Document<T> | false> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    const items = await this.getEntriesByFindOptions(findOptions);

                    if (items.length === 0) {
                        return res(false);
                    }

                    const updated = await this.update(items[0], data);
                    if (updated) this.ctx.emit('update');

                    return res(updated);
                });
            })
        );
    }

    /**
     * @description
     * Collection method to select the first `Document` from the collection that satisfies a given set
     * of find simplified options and update it with the given data.
     *
     * -----
     *
     *@example
     * ```ts
     * import { Flotsam } from "flotsam";
     * import { Like } from "flotsam/evaluator"
     *
     * const collection = await db.collect<{ name: string }>('collection')
     *
     * // Update the first document satisfying the given find options
     * const result = await collection.updateOneBy({ name: Like('flotsam') }, { name: 'jetsam' });
     * ```
     * ---
     *
     * @param { FindByProperty } findOptions - the find options to find the `Document` by.
     * @param { Record<string, unknown> } data - the data to update the `Document` with.
     * @returns { Promise<Document | false> } a Promise containing the updated `Document`
     * or false, indicating that no `Document was found`.
     */

    async updateOneBy(findOptions: FindByProperty<T>, data: Partial<T>): Promise<Document<T> | false> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    const items = await this.getEntriesByFindOptions({ where: findOptions });

                    if (items.length === 0) {
                        return res(false);
                    }

                    const updated = await this.update(items[0], data);
                    if (updated) this.ctx.emit('update');

                    return res(updated);
                });
            })
        );
    }

    /**
     * @description
     * Collection method to select a number of `Documents` according to the given find options
     * and update them with a given set of data.
     *
     * ---
     *
     *@example
     * ```ts
     * import { Flotsam } from "flotsam";
     * import { Like } from "flotsam/evaluator"
     *
     * const collection = await db.collect<{ name: string }>('collection')
     *
     * // Search for any number of Documents containing a `name` property including 'flotsam'
     * // and update them
     * const result = await collection.updateMany({ where: {name: Like('flotsam') }}, { name: 'jetsam' });
     * ```
     *
     * The full set of `FindOptions` applies, meaning the results can filtered, limited, skipped and orderer
     * before executing the update operation.
     *
     * ---
     *
     * @param { FindOptions } findOptions - the given FindOptions to select `Documents` by.
     * @param { Record<string, unknown> } data - a object containing the data to update.
     * @returns { Promise<Document[]> } an Array of Documents.
     */

    async updateMany(findOptions: FindOptions<T>, data: Partial<T>): Promise<Document<T>[] | false> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    const items = await this.getEntriesByFindOptions(findOptions);

                    if (items.length === 0) {
                        return res(false);
                    }

                    const updated = await Promise.all(
                        items.map(async (item) => {
                            const updated = await this.update(item, data);
                            if (updated) this.ctx.emit('update');
                            return updated;
                        })
                    );

                    return res(updated.every(isTruthy) ? updated : false);
                });
            })
        );
    }

    /**
     * @description
     * Collection method to select a number of `Documents` according to the given findByProperty options
     * and update them with a given set of data.
     *
     * ---
     *
     *@example
     * ```ts
     * import { Flotsam } from "flotsam";
     * import { Like } from "flotsam/evaluator"
     *
     * const collection = await db.collect<{ name: string }>('collection')
     *
     * // Search for any number of Documents containing a `name` property including 'flotsam'
     * // and update them
     * const result = await collection.updateManyBy({name: Like('flotsam') }, { name: 'jetsam' });
     * ```
     *
     * The full set of `FindOptions` applies, meaning the results can filtered, limited, skipped and orderer
     * before executing the update operation.
     *
     * ---
     *
     * @param { FindByProperty } findOptions - the given FindOptions to select `Documents` by.
     * @param { Record<string, unknown> } data - a object containing the data to update.
     * @returns { Promise<Document[]> } an Array of Documents.
     */

    async updateManyBy(findOptions: FindByProperty<T>, data: Partial<T>): Promise<Document<T>[] | false> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    const items = await this.getEntriesByFindOptions({ where: findOptions });

                    if (items.length === 0) {
                        return res(false);
                    }

                    const updated = await Promise.all(
                        items.map(async (item) => {
                            const updated = await this.update(item, data);
                            if (updated) this.ctx.emit('update');
                            return updated;
                        })
                    );

                    return res(updated.every(isTruthy) ? updated : false);
                });
            })
        );
    }
}
