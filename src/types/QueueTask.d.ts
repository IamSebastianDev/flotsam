/** @format */

/**
 * @description
 * Object used as a task inside the queue, containing methods
 * to resolve, reject and execute the task
 */

export type QueueTask = {
    execute: () => Promise<any>;
    resolve: (value: any) => any;
    reject: (reason?: any) => void;
};
