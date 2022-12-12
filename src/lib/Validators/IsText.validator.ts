/** @format */

import { TextValidatorInit, ValidatorFunction } from '../../types';
import { FlotsamValidationError } from '../../utils';

/**
 * @description
 * Validator to check a given value to be inserted or updated for being a text. The value can receive
 * an optional object to configure the Validator to check for a minimum and/or maximum length.
 *
 * -----
 *@example
 * ```ts
 * import { Flotsam } from "flotsam/db";
 * import { NotNull, IsText } from "flotsam/validators";
 *
 * const collection = await db.collect<{ description: string }>('collection', {
 *      validate: {
 *          age: [NotNull, IsText({ min: 200 })]
 *      }
 * });
 *
 * ```
 * -----
 *
 * @param { TextValidatorInit } [validationRules]
 * @returns { ValidatorFunction } a ValidatorFunction to validate Integers
 */

export const IsText = (validationRules?: TextValidatorInit): ValidatorFunction => {
    const { min, max } = validationRules || {};
    return (value: unknown, propertyName?: string) => {
        // skip null or undefined values by default
        if (value === null || value === undefined) {
            return true;
        }

        if (typeof value !== 'string') {
            throw new FlotsamValidationError(`Expected property '${propertyName}' to be a String.`);
        }

        if (min && value.length < min) {
            throw new FlotsamValidationError(`Expected property '${propertyName}' to be at least of length '${min}'.`);
        }

        if (max && value.length > max) {
            throw new FlotsamValidationError(`Expected property '${propertyName}' to be at most of length '${max}'.`);
        }

        return true;
    };
};
