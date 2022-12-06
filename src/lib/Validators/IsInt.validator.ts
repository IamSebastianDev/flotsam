/** @format */

import { IntegerValidatorInit, ValidatorFunction } from '../../types';
import { FlotsamValidationError } from '../../utils';

export const IsInt = (init?: IntegerValidatorInit): ValidatorFunction => {
    const { min, max } = init || {};
    return (value: unknown, propertyName: string) => {
        if (!Number.isInteger(value) || typeof value !== 'number') {
            throw new FlotsamValidationError(`Expected property '${propertyName}' to be an Integer.`);
        }

        if (min && value < min) {
            throw new FlotsamValidationError(`Expected property '${propertyName}' to be at least of size '${min}'.`);
        }

        if (max && value > max) {
            throw new FlotsamValidationError(`Expected property '${propertyName}' to be at most of size '${max}'.`);
        }

        return true;
    };
};
