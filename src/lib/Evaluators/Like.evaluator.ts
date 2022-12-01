/** @format */

import { EvaluatorFunction, EvaluatorOptions } from '../../types';
import { isNonNull } from '../../utils';

/**
 * @description
 * Evaluator Function to compare a given string for being included in a stored string. `Like` will ignore case.
 * The second parameter is an optional object that can set the function to be
 * strict. In strict mode, null or undefined will throw an error instead of evaluating to false, if null is not
 * the given search value.
 *
 * -----
 *
 *@example
 * ```ts
 * import { Flotsam } from "flotsam/db";
 * import { Like } from "flotsam/evaluators";
 *
 * const collection = await db.collect<{ name: string }>('collection')
 *
 * // Search for a Document containing a `name` property including 'flotsam'
 * const result = await collection.findOneBy({name: Like('flotsam')});
 *
 * // Perform the same search, but throw an error when encountering a null or undefined value
 * const result = await collection.findOneBy({name: Like('flotsam', { strict: true })});
 * ```
 *
 * ---
 *
 * @param { string } condition - the value to check for exact equality
 * @param { EvaluatorOptions } [options] - optional object containing properties to configure the Evaluator
 * @returns { EvaluatorFunction }
 */

export const Like = (condition: string, options: EvaluatorOptions = {}): EvaluatorFunction => {
    const { strict } = options;
    return (value: unknown, propName?: string) => {
        if (!isNonNull(value) && isNonNull(condition)) {
            if (!strict) return false;
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
