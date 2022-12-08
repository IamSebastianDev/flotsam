/** @format */

import { IntegerValidatorInit, ValidatorFunction } from '../../types';
import { FlotsamValidationError } from '../../utils';

/**
 * @description
 * Validator to check a given value to be inserted or updated for being an Integer. The value can receive
 * an optional object to configure the Validator to check for a minimum and/or maximum value.
 *
 * -----
 *@example
 * ```ts
 * import { Flotsam } from "flotsam/db";
 * import { NotNull, IsInt } from "flotsam/validators";
 *
 * const collection = await db.collect<{ age: number }>('collection', {
 *      validate: {
 *          age: [NotNull, IsInt({ min: 6, max: 99 })]
 *      }
 * });
 *
 * ```
 * -----
 *
 * @param { IntegerValidatorInit } [validationRules]
 * @returns { ValidatorFunction } a ValidatorFunction to validate Integers
 */

export const IsInt = (validationRules?: IntegerValidatorInit): ValidatorFunction => {
    const { min, max } = validationRules || {};
    return (value: unknown, propertyName: string) => {
        if (!Number.isInteger(value) || typeof value !== 'number') {
            throw new FlotsamValidationError(`Expected property '${propertyName}' to be an Integer.`);
        }

        if (min && value < min) {
            throw new FlotsamValidationError(`Expected property '${propertyName}' to be at least of size '${min}'.`);
        }

        if (max && value > max) {
            throw new FlotsamValidationError(`Expected property '${propertyName}' to be at most of size '${max}'.`);
        }

        return true;
    };
};
