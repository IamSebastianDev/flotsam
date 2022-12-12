/** @format */

import { ValidatorFunction } from '../../types';
import { FlotsamValidationError } from '../../utils';

/**
 * @throws
 * @description
 * Evaluator Function to validate a Value to be of type string.
 *
 * -----
 *@example
 * ```ts
 * import { Flotsam } from "flotsam/db";
 * import { NotNull, IsString } from "flotsam/validators";
 *
 * const collection = await db.collect<{ name: string }>('collection', {
 *      validate: {
 *          name: [NotNull, IsString]
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

export const IsString: ValidatorFunction = (value: unknown, propertyName?: string): boolean => {
    // skip null or undefined values by default
    if (value === null || value === undefined) {
        return true;
    }

    if (typeof value === 'string') return true;

    throw new FlotsamValidationError(`Property '${propertyName}' must be of type 'string'`);
};
