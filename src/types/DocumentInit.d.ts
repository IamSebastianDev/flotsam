/** @format */

export type DocumentInit<T extends Record<string, unknown>> = {
    _id: string;
    _: T;
};
