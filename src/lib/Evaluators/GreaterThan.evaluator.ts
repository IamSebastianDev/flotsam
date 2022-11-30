/** @format */

import { EvaluatorFunction, EvaluatorOptions } from '../../types';
import { isNonNull } from '../../utils';

/**
 * @description
 * Evaluator Function to compare a given condition for being greater than a stored value.
 * The second parameter is an optional object that can set the function to be
 * strict. In strict mode, null or undefined will throw an error instead of evaluating to false, if null is not
 * the given search value.
 *
 * -----
 *
 *@example
 * ```ts
 * import { Flotsam } from "flotsam";
 * import { GreaterThan } from "flotsam/evaluator"
 *
 * const collection = await db.collect<{ age: number }>('collection')
 *
 * // Search for a Document containing a `age` property greater than 3
 * const result = await collection.findOneBy({age: GreaterThan(3)});
 *
 * // Perform the same search, but throw an error when encountering a null or undefined value
 * const result = await collection.findOneBy({age: GreaterThan(3, { strict: true })});
 * ```
 *
 * ---
 *
 * @param { number } condition - the value to check for being greater than the value stored
 * @param { EvaluatorOptions } [options] - optional object containing properties to configure the Evaluator
 * @returns { EvaluatorFunction }
 */

export const GreaterThan = (condition: number, options: EvaluatorOptions = {}): EvaluatorFunction => {
    const { strict } = options;
    return (value: unknown, propName?: string) => {
        if (!isNonNull(value) && isNonNull(condition)) {
            if (!strict) return false;
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
 * Evaluator Function to compare a given condition for being greater or equal to a stored value.
 * The second parameter is an optional object that can set the function to be
 * strict. In strict mode, null or undefined will throw an error instead of evaluating to false, if null is not
 * the given search value.
 *
 * -----
 *
 *@example
 * ```ts
 * import { Flotsam } from "flotsam";
 * import { GreaterThanOrEqual } from "flotsam/evaluator"
 *
 * const collection = await db.collect<{ age: number }>('collection')
 *
 * // Search for a Document containing a `age` property greater or equal to 3
 * const result = await collection.findOneBy({age: GreaterThanOrEqual(3)});
 *
 * // Perform the same search, but throw an error when encountering a null or undefined value
 * const result = await collection.findOneBy({age: GreaterThanOrEqual(3, { strict: true })});
 * ```
 *
 * ---
 *
 * @param { number } condition - the value to check for being greater than the value stored
 * @param { EvaluatorOptions } [options] - optional object containing properties to configure the Evaluator
 * @returns { EvaluatorFunction }
 */

export const GreaterThanOrEqual = (condition: number, options: EvaluatorOptions = {}): EvaluatorFunction => {
    const { strict } = options;
    return (value: unknown, propName?: string) => {
        if (typeof value !== 'number') {
            if (!isNonNull(value) && isNonNull(condition)) {
                if (!strict) return false;
                throw new TypeError(`[Query] Property ${propName} is null or undefined.`);
            }

            throw new TypeError(
                `[Query] Evaluator 'GreaterThanOrEqual' can only be used for values that are of type 'Number', received type ${typeof value}`
            );
        }

        return value >= condition;
    };
};
