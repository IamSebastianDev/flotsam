/** @format */

import { EvaluatorFunction } from '../../types';
import { isNonNull } from '../../utils';

/**
 * @description
 * Method to check if a given set of values satisfies the checked value.
 *
 * @param { Array<unknown> } condition - Array of values to check a value for being a part of.
 * @returns { EvaluatorFunction }
 */

export const In = (...condition: Array<unknown>): EvaluatorFunction => {
    return (value: unknown, propName?: string) => {
        if (!isNonNull(value)) {
            throw new TypeError(`[Query] Property ${propName} is null or undefined.`);
        }

        return [...condition].flat().findIndex((e) => e == value) !== -1;
    };
};
