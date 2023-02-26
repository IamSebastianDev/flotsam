/** @format */

import { EvaluatorFunction, EvaluatorOptions, FindByProperty } from '../../types';
import { FlotsamEvaluationError, isNonNull } from '../../utils';

/**
 * @description
 * Evaluator Function to check all items of a given Array with a given set of findByPropertyOptions.
 *
 * -----
 *
 *@example
 * ```ts
 * import { Flotsam } from "flotsam/db";
 * import { Includes, Exactly } from "flotsam/evaluators";
 *
 * const collection = await db.collect<{ obj: {key: string} }>('collection')
 *
 * // Search for a Document containing a arr property that contains an element
 * // that matches a 'flotsam' string
 * const result = await collection.findOneBy({ arr: Includes(Exactly('flotsam')) });
 *
 * // Perform the same search, but throw an error when encountering a null or undefined value
 * const result = await collection.findOneBy({ arr: Includes(Exactly('flotsam'), { strict: true }) });
 * ```
 *
 * ---
 *
 * @param { EvaluatorFunction } evaluator - the Evaluator to match the contained items instead
 * @param { EvaluatorOptions } [options] - optional object containing properties to configure the Evaluator
 * @returns { EvaluatorFunction }
 */

export const Includes = <T>(evaluator: EvaluatorFunction, options?: EvaluatorOptions): EvaluatorFunction => {
    const { strict } = options || {};
    return <T, K extends Record<PropertyKey, unknown>>(value: T, propertyName?: string, document?: K) => {
        if (value === null || value === undefined) {
            if (!strict) return false;
            throw new FlotsamEvaluationError(`[Query] Property ${propertyName} is null or undefined.`);
        }

        if (!Array.isArray(value)) {
            throw new FlotsamEvaluationError(
                `Property '${propertyName}' was expected to be of type 'Array' but is of type '${typeof value}' instead.`
            );
        }

        if (value.length === 0) {
            throw new FlotsamEvaluationError(`Property '${propertyName}' appears to be empty and cannot be queried.`);
        }

        return value.some((item) => evaluator(item, propertyName, document));
    };
};
