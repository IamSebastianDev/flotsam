/** @format */

import { FlotsamValidationError } from '../../utils';

export const IsInt = (value: unknown, propertyName: string) => {
    if (!Number.isInteger(value)) {
        throw new FlotsamValidationError(`Expected property '${propertyName}' to be an Integer.`);
    }

    return true;
};
