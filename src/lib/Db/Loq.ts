/** @format */

import { existsSync } from 'node:fs';
import { appendFile, readFile, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { safeAsyncAbort, __root } from '../../utils';
import { Flotsam } from './Flotsam';
import { Queue } from './Queue';

/**
 * @description
 * Class used to write logs to the `log` file and `process.stdout`.
 */
export class Loq {
    #maxSafeFileSize: number = 157286400;
    #queue: Queue = new Queue();
    constructor(private ctx: Flotsam) {
        if (this.ctx._log?.maxSafeFileSize && this.ctx._log?.maxSafeFileSize > 0) {
            this.#maxSafeFileSize = this.ctx._log.maxSafeFileSize;
        }
    }

    get file() {
        return this.ctx._log.path;
    }

    get quiet() {
        return this.ctx._log.quiet;
    }

    private writeToStdOut(message: string) {
        if (this.ctx._log.quiet) return;
        process.stdout.write(message);
    }

    private async writeToFile(message: string) {
        this.#queue.enqueue(
            new Promise((res, rej) => {
                return safeAsyncAbort(rej, async () => {
                    if (this.quiet || !this.file) return;

                    const destination = __root(this.file);

                    if (!existsSync(destination)) {
                        await writeFile(destination, '', 'utf-8');
                    }

                    const { size } = await stat(destination);

                    if (size > this.#maxSafeFileSize) {
                        let lines = (await readFile(destination, 'utf-8')).split('\n');
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
