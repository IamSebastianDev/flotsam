/** @format */

import { EvaluatorFunction } from '../../types';
import { isNonNull } from '../../utils';

/**
 * @description
 * Method to check if a given value is a substring of the value of the checked property. The method ignores case and
 * will throw an error if a type mismatch is found.
 *
 * @param { string } condition - the value to check for being included
 * @returns { EvaluatorFunction }
 */

export const Like = (condition: string): EvaluatorFunction => {
    return (value: unknown, propName?: string) => {
        if (!isNonNull(value)) {
            throw new TypeError(`[Query] Property ${propName} is null or undefined.`);
        }

        if (typeof value !== 'string') {
            throw new TypeError(
                `[Query] Evaluator 'Like' can only be used for values that are of type 'String', received type ${typeof value}`
            );
        }

        return value.toLowerCase().includes(condition.toLowerCase());
    };
};
