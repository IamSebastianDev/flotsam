/** @format */

import { FlotsamValidationError } from '../../utils';
import type { Primitive } from '../../types';

export const IsType = (proposedType: Primitive) => {
    return (value: unknown, propertyName: string) => {
        if (typeof value === proposedType) return true;

        throw new FlotsamValidationError(
            `Expected property '${propertyName}' to be of type '${proposedType}'. Found property to be of type '${typeof value}' instead.`
        );
    };
};
