/** @format */

import { existsSync } from 'node:fs';
import { appendFile, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { __root } from '../utils';
import { Flotsam } from './Flotsam';

export class Loq {
    #maxSafeFileSize: number = 157286400;
    constructor(private ctx: Flotsam) {}

    private async writeToFile(message: string) {
        if (this.ctx.quiet || !this.ctx.log) return;

        const destination = resolve(this.ctx.root, this.ctx.log);

        if (!existsSync(destination)) {
            await writeFile(destination, '', 'utf-8');
        }

        const { size } = await stat(destination);
        let lines = (await readFile(destination, 'utf-8')).split('\n');

        if (size > this.#maxSafeFileSize) {
            lines = lines.filter((_, i) => i > 100);
            await writeFile(destination, lines.join('\n'), 'utf-8');
        }

        await appendFile(destination, message, 'utf-8');
    }

    error(error: string) {
        this.writeToFile(`[ERROR]:[${new Date().toUTCString()}] - ${error}\n`);
    }
    message(content: string) {
        this.writeToFile(`[INFO]:[${new Date().toUTCString()}] - ${content}\n`);
    }
}
