/** @format */

import { EvaluatorFunction } from '../../types';

/**
 * @description
 * Method to create a environment that will suppress all errors thrown by the Evaluator passed to it.
 *
 * @param { EvaluatorFunction } evaluator - the Evaluator to execute unsafely. This will suppress any
 * error thrown and instead return false;
 * @returns { EvaluatorFunction } a new Evaluator to use.
 */

export const Unsafe = (evaluator: EvaluatorFunction): EvaluatorFunction => {
    return <T, K extends Record<string, unknown>>(value: T, propertyName?: string, document?: K) => {
        try {
            return evaluator(value, propertyName, document);
        } catch (e) {
            return false;
        }
    };
};
