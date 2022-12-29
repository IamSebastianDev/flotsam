/** @format */

import { FlotsamValidationError } from '../../utils';
import { ValidationStrategy, ValidatorFunction } from '../../types';

/**
 * @description
 * Validator to validate the properties of a given object.
 *
 * -----
 *@example
 * ```ts
 * import { Flotsam } from "flotsam/db";
 * import { NotNull, ValidateNested, IsString } from "flotsam/validators";
 *
 * const collection = await db.collect<{ object: { key: string } } }>('collection', {
 *      validate: {
 *          object: [NotNull, ValidateNested({
 *              key: [NotNull, IsString]
 *          })]
 *      }
 * });
 *
 * ```
 * -----
 *
 * @param { ValidationStrategy } [validationStrategy] - the validation strategy to validate against
 * @returns { ValidatorFunction } a ValidatorFunction to validate objects
 */

export const ValidateNested = <T extends Record<string, unknown>>(
    validationStrategy: ValidationStrategy<T>
): ValidatorFunction => {
    return <T, K>(value: T, propertyName?: string, document?: K) => {
        // skip null or undefined values by default
        if (value === null || value === undefined) {
            return true;
        }

        if (typeof value !== 'object') {
            throw new FlotsamValidationError(
                `Property '${propertyName}' was expected to be of type 'Object' but is of type '${typeof value}' instead.`
            );
        }

        if (Object.keys(value).length === 0) {
            throw new FlotsamValidationError(`Property '${propertyName}' appears to be empty and cannot be evaluated.`);
        }

        return Object.entries(validationStrategy).every(([property, validatorFunctions]) => {
            return [validatorFunctions]
                .flat()
                .every((validator) => validator((value as Record<string, unknown>)[property], property, value));
        });
    };
};
