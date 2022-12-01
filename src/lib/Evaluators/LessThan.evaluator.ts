/** @format */

import { EvaluatorFunction, EvaluatorOptions } from '../../types';
import { isNonNull } from '../../utils';

/**
 * @description
 * Evaluator Function to compare a given condition for being less than a stored value.
 * The second parameter is an optional object that can set the function to be
 * strict. In strict mode, null or undefined will throw an error instead of evaluating to false, if null is not
 * the given search value.
 *
 * -----
 *
 *@example
 * ```ts
 * import { Flotsam} from "flotsam/db";
 * import { LessThan } from "flotsam";
 *
 * const collection = await db.collect<{ age: number }>('collection')
 *
 * // Search for a Document containing a `age` property less than 3
 * const result = await collection.findOneBy({age: LessThan(3)});
 *
 * // Perform the same search, but throw an error when encountering a null or undefined value
 * const result = await collection.findOneBy({age: LessThan(3, { strict: true })});
 * ```
 *
 * ---
 *
 * @param { number } condition - the value to check for being less than the value stored
 * @param { EvaluatorOptions } [options] - optional object containing properties to configure the Evaluator
 * @returns { EvaluatorFunction }
 */

export const LessThan = (condition: number, options: EvaluatorOptions = {}): EvaluatorFunction => {
    const { strict } = options;
    return (value: unknown, propName?: string) => {
        if (!isNonNull(value) && isNonNull(condition)) {
            if (!strict) return false;
            throw new TypeError(`[Query] Property ${propName} is null or undefined.`);
        }

        if (typeof value !== 'number') {
            throw new TypeError(
                `[Query] Evaluator 'LessThan' can only be used for values that are of type 'Number', received type ${typeof value}`
            );
        }

        return value < condition;
    };
};

/**
 * @description
 * Evaluator Function to compare a given condition for being less than or equal to a stored value.
 * The second parameter is an optional object that can set the function to be
 * strict. In strict mode, null or undefined will throw an error instead of evaluating to false, if null is not
 * the given search value.
 *
 * -----
 *
 *@example
 * ```ts
 * import { Flotsam } from "flotsam/db";
 * import { LessThanOrEqual } from "flotsam/evaluators";
 *
 * const collection = await db.collect<{ age: number }>('collection')
 *
 * // Search for a Document containing a `age` property less than or equal to 3
 * const result = await collection.findOneBy({age: LessThanOrEqual(3)});
 *
 * // Perform the same search, but throw an error when encountering a null or undefined value
 * const result = await collection.findOneBy({age: LessThanOrEqual(3, { strict: true })});
 * ```
 *
 * ---
 *
 * @param { number } condition - the value to check for being less than the value stored
 * @param { EvaluatorOptions } [options] - optional object containing properties to configure the Evaluator
 * @returns { EvaluatorFunction }
 */

export const LessThanOrEqual = (condition: number, options: EvaluatorOptions = {}): EvaluatorFunction => {
    const { strict } = options;
    return (value: unknown, propName?: string) => {
        if (typeof value !== 'number') {
            if (!isNonNull(value) && isNonNull(condition)) {
                if (!strict) return false;
                throw new TypeError(`[Query] Property ${propName} is null or undefined.`);
            }

            throw new TypeError(
                `[Query] Evaluator 'LessThanOrEqual' can only be used for values that are of type 'Number', received type ${typeof value}`
            );
        }

        return value <= condition;
    };
};
