/** @format */

import { ArrayValidatorInit, ValidatorFunction } from '../../types';
import { FlotsamValidationError } from '../../utils';

export const IsArray = (validationRules?: ArrayValidatorInit): ValidatorFunction => {
    const { min, max, items } = validationRules || {};
    return (value: unknown, propertyName: string) => {
        if (!Array.isArray(value)) {
            throw new FlotsamValidationError(
                `Expected property '${propertyName}' to be of type 'Array'. Found property to be of type '${typeof value}' instead.`
            );
        }

        const { length } = value;

        if (min && length < min) {
            throw new FlotsamValidationError(
                `Expected property '${propertyName}' to be at least of length '${min}'. Found length '${length}' instead.`
            );
        }

        if (max && length > max) {
            throw new FlotsamValidationError(
                `Expected property '${propertyName}' to be at max of length '${max}'. Found length '${length}' instead.`
            );
        }

        if (items && !value.every((item) => typeof item === items)) {
            throw new FlotsamValidationError(
                `Expected property '${propertyName}' to contain only elements of type '${items}'.`
            );
        }

        return true;
    };
};
