/** @format */

import { ValidatorFunction } from '../../types';
import { FlotsamValidationError } from '../../utils';

export const NotNull: ValidatorFunction = (value: unknown, propertyName: string) => {
    if (value !== null && value !== undefined) return true;

    throw new FlotsamValidationError(`Property '${propertyName}' can not be NULL.`);
};
