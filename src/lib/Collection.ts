/** @format */

import { __root } from '../utils';
import { Flotsam } from './Flotsam';
import { readdir, mkdir, rmdir, stat } from 'node:fs/promises';

export class Collection<T extends Record<string, unknown>> {
    dir: string;
    constructor(private ctx: Flotsam, private namespace: string) {
        this.dir = __root(this.ctx.root, this.namespace);

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
