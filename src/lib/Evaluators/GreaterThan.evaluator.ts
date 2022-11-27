/** @format */

import { EvaluatorFunction } from '../../types';
import { isNonNull } from '../../utils';

/**
 * @description
 * Method to compare if the given value is greater than the value that is being checked.
 *
 * @param { number } condition - the number to use for the check.
 * @returns { EvaluatorFunction }
 */

export const GreaterThan = (condition: number): EvaluatorFunction => {
    return (value: unknown, propName?: string) => {
        if (!isNonNull(value)) {
            throw new TypeError(`[Query] Property ${propName} is null or undefined.`);
        }

        if (typeof value !== 'number') {
            throw new TypeError(
                `[Query] Evaluator 'GreaterThan' can only be used for values that are of type 'Number', received type ${typeof value}`
            );
        }

        return value > condition;
    };
};

/**
 * @description
 * Method to compare if the given value is greater than or equal to the value that is being checked.
 *
 * @param { number } condition - the number to use for the check.
 * @returns { EvaluatorFunction }
 */

export const GreaterThanOrEqual = (condition: number): EvaluatorFunction => {
    return (value: unknown, propName?: string) => {
        if (typeof value !== 'number') {
            if (!isNonNull(value)) {
                throw new TypeError(`[Query] Property ${propName} is null or undefined.`);
            }

            throw new TypeError(
                `[Query] Evaluator 'GreaterThan' can only be used for values that are of type 'Number', received type ${typeof value}`
            );
        }

        return value >= condition;
    };
};
