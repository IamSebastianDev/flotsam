/** @format */

import { FlotsamValidationError } from '../../utils';
import type { Primitive, TypeValidatorInit, ValidatorFunction } from '../../types';

const isPrimitive = (value: unknown): value is Primitive => {
    return (
        typeof value === 'string' &&
        ['string', 'number', 'object', 'function', 'bigint', 'symbol', 'undefined', 'boolean'].includes(value)
    );
};

/**
 * @description
 * Validator to check a given value to be inserted or updated for being an Array. The Validator is being constructed
 * by passing an object containing a `type` property. The property can either contain a `string` describing the expected
 * type or a function to evaluate the property to be a certain type.
 *
 * -----
 *@example
 * ```ts
 * import { Flotsam } from "flotsam/db";
 * import { NotNull, IsType } from "flotsam/validators";
 *
 * const authors = ['J.R.R Tolkien', 'Rebecca Gable', 'Douglas Adams']
 *
 * const collection = await db.collect<{ title: string, author: string[] }>('collection', {
 *      validate: {
 *          title: [NotNull, IsType({ type: "string" })],
 *          author: [
 *              NotNull,
 *              IsType({ type: (value) => authors.includes(value)})
 *          ]
 *      }
 * });
 *
 * ```
 * -----
 *
 * @param { TypeValidatorInit } validationRules
 * @returns { ValidatorFunction } a ValidatorFunction to validate (complex) Types
 */

export const IsType = (validationRules: TypeValidatorInit): ValidatorFunction => {
    const { type } = validationRules;
    return (value: unknown, propertyName: string) => {
        if (typeof type === 'function') {
            if (type(value, propertyName)) {
                return true;
            }

            throw new FlotsamValidationError(`Property '${propertyName}' is not of the expected type.`);
        }

        if (isPrimitive(type)) {
            if (typeof value === type) {
                return true;
            }

            throw new FlotsamValidationError(
                `Expected property '${propertyName}' to be of type '${type}'. Found property to be of type '${typeof value}' instead.`
            );
        }

        throw new FlotsamValidationError(`Property ${propertyName} could not be evaluated.`);
    };
};
