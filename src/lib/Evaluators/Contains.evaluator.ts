/** @format */

import { EvaluatorFunction, EvaluatorOptions, FindByProperty } from '../../types';
import { FlotsamEvaluationError, isNonNull } from '../../utils';

/**
 * @description
 * Evaluator Function to compare nested properties against a new set of findByPropertyOptions.
 *
 * -----
 *
 *@example
 * ```ts
 * import { Flotsam } from "flotsam/db";
 * import { Contains, Exactly } from "flotsam/evaluators";
 *
 * const collection = await db.collect<{ obj: {key: string} }>('collection')
 *
 * // Search for a Document containing a 'key' property inside the 'obj' property
 * // that matches a 'flotsam' string
 * const result = await collection.findOneBy({ obj: Contains({ key: Exactly('flotsam') }) });
 *
 * // Perform the same search, but throw an error when encountering a null or undefined value
 * const result = await collection.findOneBy({ obj: Contains({ key: Exactly('flotsam') }, { strict: true }) });
 * ```
 *
 * ---
 *
 * @param { FindByProperty } findOptions - the set of FindByPropertyOptions to evaluate
 * @param { EvaluatorOptions } [options] - optional object containing properties to configure the Evaluator
 * @returns { EvaluatorFunction }
 */

export const Contains = <T>(findOptions: FindByProperty<T>, options?: EvaluatorOptions): EvaluatorFunction => {
    const { strict } = options || {};
    return <T, K>(value: T, propertyName?: string, document?: K) => {
        if (value === null || value === undefined) {
            if (!strict) return false;
            throw new FlotsamEvaluationError(`[Query] Property ${propertyName} is null or undefined.`);
        }

        if (typeof value !== 'object') {
            throw new FlotsamEvaluationError(
                `Property '${propertyName}' was expected to be of type 'Object' but is of type '${typeof value}' instead.`
            );
        }

        if (Object.keys(value).length === 0) {
            throw new FlotsamEvaluationError(`Property '${propertyName}' appears to be empty and cannot be queried.`);
        }

        return ([findOptions].flat() as FindByProperty<T>[]).some((findOption) => {
            return Object.entries(findOption).every(([prop, evaluator]) => {
                return typeof evaluator === 'function'
                    ? evaluator((value as Record<string, unknown>)[prop], prop, document)
                    : (value as Record<string, unknown>)[prop] === evaluator;
            });
        });
    };
};
