/** @format */

import { __root, safeAsyncAbort } from '../utils';
import { Flotsam } from './Flotsam';
import { readdir, mkdir, rm, stat, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { ObjectId } from './ObjectId';
import { JSONDocument } from './JSONDocument';
import { resolve } from 'node:path';
import { Queue } from './Queue';
import type { Document, Rejector, FindOptions } from '../types';
import { evaluateFindOptions } from './Evaluators/evaluateFindOptions';

export class Collection<T extends Record<string, unknown>> {
    dir: string;
    #files: string[] = [];
    #documents: Map<string, JSONDocument<T>> = new Map();
    #queue: Queue = new Queue();
    constructor(private ctx: Flotsam, private namespace: string) {
        this.dir = resolve(ctx.root, this.namespace);

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

    get entries(): Promise<Array<Document<T>>> {
        return new Promise((res) => res([...this.#documents.values()]));
    }

    async deserialize() {
        /**
         * Deserialization
         */

        if (!existsSync(this.dir)) {
            await mkdir(this.dir);
        }

        // get all documents inside the dir
        this.#files = (await readdir(this.dir)).filter((file) => ObjectId.is(file));

        for await (const document of this.#files) {
            const doc = JSON.parse(await readFile(resolve(this.dir, document), 'utf-8'));
            this.#documents.set(ObjectId.from(doc._id), new Document({ _id: document, _: doc }));
        }

        this.ctx.emit('deserialize', this);
    }

    async serialize() {
        if (!existsSync(this.dir)) {
            await mkdir(this.dir);
        }

        for await (const [id, document] of [...this.#documents.entries()]) {
            const path = resolve(this.dir, id.str);
            await writeFile(path, document.toFile(), 'utf-8');
        }

        this.ctx.emit('serialize', this);
    }

    async drop(): Promise<boolean> {
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
                    const item = [...this.#documents.entries()].find(([, value]) =>
                        evaluateFindOptions(value.toDoc(), findOptions)
                    );

                    if (item !== undefined) {
                        this.#documents.delete(item[0]);
                        await rm(resolve(this.dir, item[0]));
                        this.ctx.emit('delete');

                        return res(item[1].toDoc());
                    }

                    return res(false);
                });
            })
        );
    }
    }
}
