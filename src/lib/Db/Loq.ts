/** @format */

import { existsSync } from 'node:fs';
import { appendFile, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { safeAsyncAbort, __root } from '../../utils';
import { Flotsam } from './Flotsam';
import { Queue } from './Queue';

export class Loq {
    #maxSafeFileSize: number = 157286400;
    #queue: Queue = new Queue();
    constructor(private ctx: Flotsam) {}

    private writeToStdOut(message: string) {
        if (this.ctx.quiet) return;
        process.stdout.write(message);
    }

    private async writeToFile(message: string) {
        this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(rej, async () => {
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
                });
            })
        );
    }

    private get timestamp(): string {
        return new Date().toUTCString().replace(',', ':');
    }

    error(error: string) {
        const message = `[ERROR]:[${this.timestamp}] - ${error}\n`;
        this.writeToFile(message);
        this.writeToStdOut(message);
    }

    message(content: string) {
        this.writeToFile(`[INFO]:[${this.timestamp}] - ${content}\n`);
    }
}
