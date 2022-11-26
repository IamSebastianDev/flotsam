/** @format */

import { FindOptions, Document } from '../../types';

/**
 * @description
 * Function to evaluate a `Document` using given find options.
 *
 * @param { Document } document - the `Document`whose properties to check
 * @param { FindOptions } findOptions - the passed find options to evaluate
 * @returns { boolean } a boolean indicating if the `Document` satisfies the
 * conditions in the find options
 */

export const evaluateFindOptions = <T extends Record<string, unknown>>(
    document: Document<T>,
    findOptions: FindOptions<T>
): boolean => {
    return Object.entries(findOptions).every(([prop, evaluator]) => evaluator(document[prop], prop));
};
