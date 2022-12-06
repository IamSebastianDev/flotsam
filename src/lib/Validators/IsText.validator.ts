/** @format */

import { TextValidatorInit, ValidatorFunction } from '../../types';
import { FlotsamValidationError } from '../../utils';

export const IsText = (init?: TextValidatorInit): ValidatorFunction => {
    const { min, max } = init || {};
    return (value: unknown, propertyName: string) => {
        if (typeof value !== 'string') {
            throw new FlotsamValidationError(`Expected property '${propertyName}' to be a String.`);
        }

        if (min && value.length < min) {
            throw new FlotsamValidationError(`Expected property '${propertyName}' to be at least of length '${min}'.`);
        }

        if (max && value.length > max) {
            throw new FlotsamValidationError(`Expected property '${propertyName}' to be at most of length '${max}'.`);
        }

        return true;
    };
};
