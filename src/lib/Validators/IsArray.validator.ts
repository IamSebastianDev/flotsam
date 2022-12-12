/** @format */

import { ArrayValidatorInit, ValidatorFunction } from '../../types';
import { FlotsamValidationError } from '../../utils';

/**
 * @description
 * Validator to check a given value to be inserted or updated for being an Array. The value can receive
 * an optional object to configure the Validator to check for a minimum and/or maximum length as well as
 * check the Array items for being of a certain type. The type can be set using a string or a
 * Validator Function or Array of Validator Functions.
 *
 * -----
 *@example
 * ```ts
 * import { Flotsam } from "flotsam/db";
 * import { NotNull, IsArray, IsString } from "flotsam/validators";
 *
 * const collection = await db.collect<{ books: string[] }>('collection', {
 *      validate: {
 *          books: [NotNull, IsArray({ min: 0, items: [NotNull, IsString]})]
 *      }
 * });
 *
 * ```
 * -----
 *
 * @param { ArrayValidatorInit } [validationRules]
 * @returns { ValidatorFunction } a ValidatorFunction to validate Arrays
 */

export const IsArray = (validationRules?: ArrayValidatorInit): ValidatorFunction => {
    const { min, max, items } = validationRules || {};
    return <T, K>(value: unknown, propertyName?: string, document?: K) => {
        // skip null or undefined values by default
        if (value === null || value === undefined) {
            return true;
        }

        if (!Array.isArray(value)) {
            throw new FlotsamValidationError(
                `Expected property '${propertyName}' to be of type 'Array'. Found property to be of type '${typeof value}' instead.`
            );
        }

        const { length } = value;

        if (min && length < min) {
            throw new FlotsamValidationError(
                `Expected property '${propertyName}' to be at least of length '${min}'. Found length '${length}' instead.`
            );
        }

        if (max && length > max) {
            throw new FlotsamValidationError(
                `Expected property '${propertyName}' to be at max of length '${max}'. Found length '${length}' instead.`
            );
        }

        if (items && typeof items === 'string' && !value.every((item) => typeof item === items)) {
            throw new FlotsamValidationError(
                `Expected property '${propertyName}' to contain only elements of type '${items}'.`
            );
        }

        if (items && typeof items !== 'string' && Array.isArray([items].flat())) {
            return value.every((entry, index) =>
                [items].flat().every((validator) => validator(entry, `${propertyName}[${index}]`), document)
            );
        }

        return true;
    };
};
