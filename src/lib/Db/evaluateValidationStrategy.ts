/** @format */

import type { Validator } from '../../types';

export const evaluateValidationStrategy = <T extends Record<string, unknown>>(
    props: T,
    validationStrategy: Validator<T>
) => {
    return Object.entries(validationStrategy.validate).every(([property, validatorFunctions]) => {
        return [validatorFunctions].flat().every((validator) => validator(props[property], property));
    });
};
