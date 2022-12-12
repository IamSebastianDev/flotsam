/** @format */

import { ValidatorFunction } from '../../types';
import { FlotsamValidationError } from '../../utils';

/**
 * @throws
 * @description
 * Evaluator Function to validate a Value to be of type number.
 *
 * -----
 *@example
 * ```ts
 * import { Flotsam } from "flotsam/db";
 * import { NotNull, IsNumber } from "flotsam/validators";
 *
 * const collection = await db.collect<{ age: number }>('collection', {
 *      validate: {
 *          age: [NotNull, IsNumber]
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

export const IsNumber: ValidatorFunction = (value: unknown, propertyName?: string): boolean => {
    // skip null or undefined values by default
    if (value === null || value === undefined) {
        return true;
    }

    if (typeof value === 'number') return true;

    throw new FlotsamValidationError(`Property '${propertyName}' must be of type 'number'`);
};
