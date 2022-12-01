/** @format */

import type { Document } from '../types';

export const isDocument = <T extends Record<string, unknown>>(object: T | Document<T>): object is Document<T> => {
    return '_id' in object;
};
