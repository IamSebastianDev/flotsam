/** @format */

import type { Document } from '../types';

/**
 * @utility
 * @description
 * Utility function to check if a value is a Document
 */

export const isDocument = <T extends Record<string, unknown>>(object: T | Document<T>): object is Document<T> => {
    return '_id' in object;
};
