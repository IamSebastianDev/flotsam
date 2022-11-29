/** @format */

import { EvaluatorFunction } from '../../types';
import { isNonNull } from '../../utils';

/**
 * @description
 * Method to check if a given value is not equal to a stored property
 *
 * @param { any } condition - Value to check for being not equal
 * @returns { EvaluatorFunction }
 */

export const NotEqual = (...condition: any): EvaluatorFunction => {
    return (value: unknown, propName?: string) => {
        if (!isNonNull(value)) {
            throw new TypeError(`[Query] Property ${propName} is null or undefined.`);
        }

        return condition !== value;
    };
};
