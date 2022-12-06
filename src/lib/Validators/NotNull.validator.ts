/** @format */

import { FlotsamValidationError } from '../../utils';

export const NotNull = (value: unknown, propertyName: string) => {
    if (value !== null && value !== undefined) return true;

    throw new FlotsamValidationError(`Property '${propertyName}' can not be NULL.`);
};
