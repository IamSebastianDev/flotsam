/** @format */

import { EvaluatorFunction } from '../../types';
import { isNonNull } from '../../utils';

/**
 * @description
 * Method to compare if the given value is less than the value that is being checked.
 *
 * @param { number } condition - the number to use for the check.
 * @returns { EvaluatorFunction }
 */

export const LessThan = (condition: number): EvaluatorFunction => {
    return (value: unknown, propName?: string) => {
        if (!isNonNull(value)) {
            throw new TypeError(`[Query] Property ${propName} is null or undefined.`);
        }

        if (typeof value !== 'number') {
            throw new TypeError(
                `[Query] Evaluator 'LessThan' can only be used for values that are of type 'Number', received type ${typeof value}`
            );
        }

        return condition < value;
    };
};

/**
 * @description
 * Method to compare if the given value is less than or equal to the value that is being checked.
 *
 * @param { number } condition - the number to use for the check.
 * @returns { EvaluatorFunction }
 */

export const LessThanOrEqual = (condition: number): EvaluatorFunction => {
    return (value: unknown, propName?: string) => {
        if (!isNonNull(value)) {
            throw new TypeError(`[Query] Property ${propName} is null or undefined.`);
        }

        if (typeof value !== 'number') {
            throw new TypeError(
                `[Query] Evaluator 'LessThan' can only be used for values that are of type 'Number', received type ${typeof value}`
            );
        }

        return condition <= value;
    };
};
