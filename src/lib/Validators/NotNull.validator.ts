/** @format */

import { ValidatorFunction } from '../../types';
import { FlotsamValidationError } from '../../utils';

/**
 * @throws
 * @description
 * Evaluator Function to validate a Value to be not Null or Undefined.
 *
 * -----
 *@example
 * ```ts
 * import { Flotsam } from "flotsam/db";
 * import { NotNull, IsString } from "flotsam/validators";
 *
 * const collection = await db.collect<{ name: string }>('collection', {
 *      validate: {
 *          name: [NotNull, IsType({type: 'string'})]
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

export const NotNull: ValidatorFunction = (value: unknown, propertyName?: string): boolean => {
    if (value !== null && value !== undefined) return true;

    throw new FlotsamValidationError(`Property '${propertyName}' can not be NULL.`);
};
