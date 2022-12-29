/** @format */

import { ValidatorFunction } from '../../types';
import { FlotsamValidationError } from '../../utils';

/**
 * @throws
 * @description
 * Validator function to validate a Value to be a valid Date.
 *
 * -----
 *@example
 * ```ts
 * import { Flotsam } from "flotsam/db";
 * import { NotNull, IsDate } from "flotsam/validators";
 *
 * const collection = await db.collect<{ date: Date }>('collection', {
 *      validate: {
 *          date: [NotNull, IsDate]
 *      }
 * });
 *
 * ```
 * -----
 *
 * @param { unknown } value - the value to validate
 * @param { string } propertyName - the name of the property that is validated
 * @returns { boolean } true if the property was successfully validated
 */

export const IsDate: ValidatorFunction = <T>(value: unknown, propertyName?: string): boolean => {
    // skip null or undefined values by default
    if (value === null || value === undefined) {
        return true;
    }

    if (!(typeof value === 'string' || typeof value === 'number' || value instanceof Date)) {
        throw new FlotsamValidationError(`Property ${propertyName} cannot be coerced into a Valid Date.`);
    }

    const parsed = Date.parse(new Date(value).toJSON());
    if (Number.isNaN(parsed)) {
        throw new FlotsamValidationError(
            `Property ${propertyName} was expected to be a valid Date, got '${parsed}' instead. Value '${value}' could not be converted into a valid Date.`
        );
    }

    return true;
};
