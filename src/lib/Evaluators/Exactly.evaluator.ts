/** @format */

import { EvaluatorFunction, EvaluatorOptions } from '../../types';
import { FlotsamEvaluationError, isNonNull } from '../../utils';

/**
 * @description
 * Evaluator Function to compare two given values for being a exact match. `Exactly` will compare type and value to be
 * strictly equal using the `===` operator. The second parameter is an optional object that can set the function to be
 * strict. In strict mode, null or undefined will throw an error instead of evaluating to false, if null is not
 * the given search value.
 *
 * -----
 *
 *@example
 * ```ts
 * import { Flotsam } from "flotsam/db";
 * import { Exactly } from "flotsam/evaluators";
 *
 * const collection = await db.collect<{ name: string }>('collection');
 *
 * // Search for a Document containing a `name` property matching exactly 'flotsam'
 * const result = await collection.findOneBy({name: Exactly('flotsam')});
 *
 * // Perform the same search, but throw an error when encountering a null or undefined value
 * const result = await collection.findOneBy({name: Exactly('flotsam', { strict: true })});
 * ```
 *
 * ---
 *
 * @param { any } condition - the value to check for exact equality
 * @param { EvaluatorOptions } [options] - optional object containing properties to configure the Evaluator
 * @returns { EvaluatorFunction }
 */

export const Exactly = (condition: any, options: EvaluatorOptions = {}): EvaluatorFunction => {
    const { strict } = options;
    return (value: unknown, propertyName?: string) => {
        if (!isNonNull(value) && isNonNull(condition)) {
            if (!strict) return false;
            throw new FlotsamEvaluationError(`Property ${propertyName} is null or undefined.`);
        }

        return value === condition;
    };
};
