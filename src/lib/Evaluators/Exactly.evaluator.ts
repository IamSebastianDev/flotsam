/** @format */

import { EvaluatorFunction } from '../../types';
import { isNonNull } from '../../utils';

/**
 * @description
 * Method to compare two values for being exactly equal. The method uses `===` strict equality
 * checking to ensure value and type equality.
 *
 * @param { any } condition - the value to check for exact equality
 * @returns { EvaluatorFunction }
 */

export const Exactly = (condition: any): EvaluatorFunction => {
    return (value: unknown, propName?: string) => {
        if (!isNonNull(value)) {
            throw new TypeError(`[Query] Property ${propName} is null or undefined.`);
        }

        return value === condition;
    };
};
