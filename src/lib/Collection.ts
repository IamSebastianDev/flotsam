/** @format */

import { __root } from '../utils';
import fs from 'node:fs';

export class Collection<T extends Record<string, unknown>> {
    #dir: string;
    constructor(private namespace: string) {
        this.#dir = __root(this.namespace);

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

    get entries() {
        return [];
    }

    async deserialize() {}
    async serialize() {}
}
