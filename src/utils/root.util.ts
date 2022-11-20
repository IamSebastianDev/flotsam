/** @format */
import { join, resolve } from 'node:path';

/**
 * @utility
 * @description
 * Utility method to construct a absolute path from a given array of
 * path fragments starting from the root of the project.
 * @param { string[] } fragments - path fragments to construct the path from the root
 * @returns { string } the constructed absolute path.
 */

export const __root = (...fragments: string[]): string => {
    return resolve(join(process.cwd(), ...fragments));
};
