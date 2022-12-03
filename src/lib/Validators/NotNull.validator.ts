/** @format */

import { FlotsamValidationError } from '../../utils';

export const NotNull = (value: unknown, propertyName: string) => {
    if (value !== null) return true;

    throw new FlotsamValidationError(`Property '${propertyName}' can not be NULL.`);
};
