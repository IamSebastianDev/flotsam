/** @format */

import type { ValidationStrategy } from './ValidationStrategy';
import type { ValidatorFunction } from './ValidatorFunction';

export type Validator<T extends Record<string, unknown>> = {
    validate: ValidationStrategy<Partial<T>>;
};
