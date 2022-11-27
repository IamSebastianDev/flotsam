/** @format */

import { type } from 'os';
import { FindOptions, Document } from '../../types';
import { FindByProperty } from '../../types/FindByProperty';

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
            return typeof evaluator === 'function' ? evaluator(document[prop], prop) : document[prop] === evaluator;
        });
    });
};

/**
 * @description
 * Function to evaluate a `Document` using a given set of simplified find by property options.
 *
 * @param { Document } document - the `Document`whose properties to check
 * @param { FindOByProperty } findOptions - the passed find options to evaluate
 * @returns { boolean } a boolean indicating if the `Document` satisfies the
 * conditions in the find options
 */

export const evaluateFindByPropertyOptions = <T extends Record<string, unknown>>(
    document: Document<T>,
    findOptions: FindByProperty<T>
): boolean => {
    return Object.entries(findOptions).every(([prop, evaluator]) => {
        return typeof evaluator === 'function' ? evaluator(document[prop], prop) : document[prop] === evaluator;
    });
};
