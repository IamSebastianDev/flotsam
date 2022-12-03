/** @format */

import type { QueueTask } from '../../types';

/**
 * @description
 * Class used to create a `Queue` to operate async operations in sequence if necessary
 */
export class Queue {
    #queue: Array<QueueTask> = [];
    #executing: boolean = false;

    public enqueue<T>(promise: Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.#queue.push({
                execute: () => promise,
                resolve,
                reject,
            });

            this.dequeue();
        });
    }

    public dequeue() {
        if (this.#executing) return;

        const task = this.#queue.shift();
        if (!task) return;

        try {
            this.#executing = true;
            task.execute()
                .then((result) => this.resolveTask(task, result))
                .catch((err) => this.rejectTask(task, err));
        } catch (err) {
            this.rejectTask(task, err);
        }
    }

    private resolveTask(task: QueueTask, result: unknown) {
        this.#executing = false;
        task.resolve(result);
        this.dequeue();
    }

    private rejectTask(task: QueueTask, reason: unknown) {
        this.#executing = false;
        task.reject(reason);
        this.dequeue();
    }

    get pending() {
        return this.#queue.length > 0;
    }

    get tasks() {
        return this.#queue.length;
    }
}
