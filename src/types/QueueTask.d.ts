/** @format */

export type QueueTask = {
    execute: () => Promise<any>;
    resolve: (value: any) => any;
    reject: (reason?: any) => void;
};
