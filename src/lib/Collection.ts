/** @format */

import { __root } from '../utils';
import { Flotsam } from './Flotsam';
import { readdir, mkdir, rmdir, stat, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { ObjectId } from './ObjectId';
import { Document } from './Document';
import { resolve } from 'node:path';

export class Collection<T extends Record<string, unknown>> {
    dir: string;
    #files: string[] = [];
    #documents: Map<ObjectId, Document<T>> = new Map();
    constructor(private ctx: Flotsam, private namespace: string) {
        this.dir = resolve(ctx.root, this.namespace);

        process.on('SIGINT', async () => {
            await this.serialize();
        });

        process.on('SIGTERM', async () => {
            await this.serialize();
        });
    }

    get count() {
        return 0;
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
        return new Promise(async (res, rej) => {
            try {
                await rmdir(this.dir);
                this.ctx.emit('drop', this);
                res(true);
            } catch (e) {
                this.ctx.emit('error', e);
                rej(e);
            }
        });
    }
}
