/** @format */

import { __root, safeAsyncAbort, isTruthy, sortByProperty } from '../utils';
import { Flotsam } from './Flotsam';
import { readdir, mkdir, rm, stat, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { ObjectId } from './ObjectId';
import { JSONDocument } from './JSONDocument';
import { resolve } from 'node:path';
import { Queue } from './Queue';
import type { Document, Rejector, FindOptions } from '../types';
import { evaluateFindOptions } from './Evaluators/evaluateFindOptions';
import { FindByProperty } from '../types/FindByProperty';
import { Crypto } from './Crypto';

export class Collection<T extends Record<string, unknown>> {
    #dir: string;
    #files: string[] = [];
    #documents: Map<string, JSONDocument<T>> = new Map();
    #queue: Queue = new Queue();
    #crypt: Crypto | null = null;
    constructor(private ctx: Flotsam, private namespace: string) {
        this.#dir = resolve(ctx.root, this.namespace);
        this.#crypt = ctx.auth ? new Crypto(ctx.auth) : null;

        process.on('SIGINT', async () => {
            await this.serialize();
        });

        process.on('SIGTERM', async () => {
            await this.serialize();
        });
    }

    /**
     * @type { Promise<number> }
     * @description
     * Returns the number of `Documents` currently in the collection.
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
     * @description
     * Returns a copy of all `Documents` in the collection.
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
            this.ctx.emit('error', error);
            reject(error);
        };
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

                    // get all documents inside the dir
                    this.#files = (await readdir(this.#dir)).filter((file) => ObjectId.is(file));

                    for await (const document of this.#files) {
                        let content = await readFile(resolve(this.#dir, document), 'utf-8');
                        if (this.#crypt) content = this.#crypt.decrypt(content);

                        const doc: { _: T; _id: string } = JSON.parse(content);
                        this.#documents.set(
                            ObjectId.from(doc._id).str,
                            new JSONDocument<T>({ _id: document, _: doc._ })
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

                    for await (const [id, document] of [...this.#documents.entries()]) {
                        const path = resolve(this.#dir, id);
                        let content = document.toFile();
                        if (this.#crypt) content = this.#crypt.encrypt(content);

                        await writeFile(path, content, 'utf-8');
                    }

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

    //@Insert Operations

    private async insert(document: JSONDocument<T>) {
        return this.#queue.enqueue(
            new Promise(async (res, rej) => {
                let content = document.toFile();
                if (this.#crypt) content = this.#crypt.encrypt(content);

                const path = resolve(this.#dir, document.id.str);
                await writeFile(path, content, 'utf-8');

                this.#documents.set(document.id.str, document);

                this.ctx.emit('insert', document.toDoc());

                return res(true);
            })
        );
    }

    /**
     * @description
     * Inserts a `Document` into the database.
     *
     * @param { Record<string, unknown> } data - the data to insert as `Document`
     * @returns { Promise<Document> } the created Document
     */

    async insertOne(data: T): Promise<Document<T> | false> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    const doc = new JSONDocument({ _: data });
                    const inserted = await this.insert(doc);

                    res(inserted ? doc.toDoc() : false);
                });
            })
        );
    }

    async insertMany(...data: T[]): Promise<Document<T>[] | false> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    const docs = data.map((doc) => new JSONDocument({ _: doc }));
                    const success = await Promise.all(
                        docs.map(async (doc) => {
                            return await this.insert(doc);
                        })
                    );

                    res(success.every(isTruthy) ? docs.map((doc) => doc.toDoc()) : false);
                });
            })
        );
    }

    // @Delete Operations

    private async delete(id: string): Promise<boolean> {
        return this.#queue.enqueue(
            new Promise(async (res) => {
                this.#documents.delete(id);
                await rm(resolve(this.#dir, id));
                this.ctx.emit('delete');
                res(true);
            })
        );
    }

    /**
     * @description
     * Method to delete the first found `Document` by a given id. Returns the deleted `Document`
     * or false, if no `Document` was found.
     *
     * @param { string } id - the id to the find the `Document` by.
     * @returns { Promise<Document | false> } the deleted `Document` or false, if no `Document` was found.
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

                    const deleted = await this.delete(items[0]._id.str);

                    return res(deleted ? items[0] : false);
                });
            })
        );
    }

    async deleteMany(findOptions: FindOptions<T>): Promise<Document<T>[] | false> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    const items = await this.getEntriesByFindOptions(findOptions);

                    if (items.length === 0) {
                        return res(false);
                    }

                    const deleted = await Promise.all(items.map(async (item) => this.delete(item._id.str)));

                    return res(deleted.every(isTruthy) ? items : false);
                });
            })
        );
    }

    //@Find Operations

    private async getEntriesByFindOptions(findOptions: FindOptions<T>): Promise<Document<T>[]> {
        return this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(this.rejector(rej), async () => {
                    let items = [...this.#documents.entries()]
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

                    if (findOptions.limit && items.length > findOptions.limit) {
                        items.length = findOptions.limit;
                    }

                    res(items);
                });
            })
        );
    }

    /**
     * @description
     * Method to select the first `Document` from the collection that satisfies it's id.
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
     * Collection method to select the first `Document` according to the given find options.
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
     * @param { [string, JSONDocument] | undefined } item - the found Document to update
     * @param { Partial<any> } data - the data to update the document with
     * @param { function(result: any): void } res - the method to resolve the outer promise
     */

    private async update(document: Document<T>, data: Partial<T>): Promise<Document<T>> {
        return this.#queue.enqueue(
            new Promise(async (res, rej) => {
                const updated = new JSONDocument({ _id: document._id.str, _: { ...document, ...data } });
                this.#documents.set(document._id.str, updated);

                let content = updated.toFile();
                if (this.#crypt) content = this.#crypt.encrypt(content);
                await writeFile(resolve(this.#dir, document._id.str), content, 'utf8');

                return res(updated.toDoc());
            })
        );
    }

    /**
     * @description
     * Method to select the first `Document` from the collection that satisfies it's id
     * and update it with the given data.
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

                    return res(updated);
                });
            })
        );
    }

    /**
     * @description
     * Method to select the first `Document` from the collection that satisfies a given set
     * of find options and update it with the given data.
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

                    return res(updated);
                });
            })
        );
    }

    /**
     * @description
     * Method to select the first `Document` from the collection that satisfies a given set
     * of find simplified options and update it with the given data.
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

                    return res(updated);
                });
            })
        );
    }
}
