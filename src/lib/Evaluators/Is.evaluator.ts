/** @format */

import { EvaluatorFunction } from '../../types';
import { isNonNull } from '../../utils';

/**
 * @description
 * Method to compare two values for being loosely equal. The method uses `==` equality
 * checking to ensure the values are equal.
 *
 * @param { any } condition - the value to check for loose equality
 * @returns { EvaluatorFunction }
 */

export const Is = (condition: any): EvaluatorFunction => {
    return (value: unknown, propName?: string) => {
        if (!isNonNull(value)) {
            throw new TypeError(`[Query] Property ${propName} is null or undefined.`);
        }

        return value == condition;
    };
};
