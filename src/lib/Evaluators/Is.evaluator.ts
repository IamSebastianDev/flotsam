/** @format */

import { EvaluatorFunction, EvaluatorOptions } from '../../types';
import { isNonNull } from '../../utils';

/**
 * @description
 * Evaluator Function to compare to given values for being a loose match. `Loosely` will compare type and value to be
 * loosely equal using the `==` operator. The second parameter is an optional object that can set the function to be
 * strict. In strict mode, null or undefined will throw an error instead of evaluating to false, if null is not
 * the given search value.
 *
 * -----
 *
 *@example
 * ```ts
 * import { Flotsam } from "flotsam";
 * import { Is } from "flotsam/evaluator"
 *
 * const collection = await db.collect<{ age: number }>('collection')
 *
 * // Search for a Document containing a `age` property matching loosely '3'
 * const result = await collection.findOneBy({age: Is('3')});
 *
 * // Perform the same search, but throw an error when encountering a null or undefined value
 * const result = await collection.findOneBy({age: Is('3', { strict: true })});
 * ```
 *
 * ---
 *
 * @param { any } condition - the value to check for loose equality
 * @param { EvaluatorOptions } [options] - optional object containing properties to configure the Evaluator
 * @returns { EvaluatorFunction }
 */

export const Is = (condition: any, options: EvaluatorOptions = {}): EvaluatorFunction => {
    const { strict } = options;
    return (value: unknown, propName?: string) => {
        if (!isNonNull(value) && isNonNull(condition)) {
            if (!strict) return false;
            throw new TypeError(`[Query] Property ${propName} is null or undefined.`);
        }

        return value == condition;
    };
};
