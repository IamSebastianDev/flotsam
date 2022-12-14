/** @format */

import { type } from 'os';
import { FindOptions, Document, FindByProperty } from '../../types';

/**
 * @description
 * Function to evaluate a `Document` using a given set of find options.
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
    return ([findOptions.where].flat() as FindByProperty<T>[]).some((findOption) => {
        return Object.entries(findOption).every(([prop, evaluator]) => {
            return typeof evaluator === 'function'
                ? evaluator(document[prop], prop, document)
                : document[prop] === evaluator;
        });
    });
};
