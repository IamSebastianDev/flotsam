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
    return (value: unknown) => {
        try {
            return evaluator(value);
        } catch (e) {
            return false;
        }
    };
};
