/** @format */

import type { ValidatorFunction } from './ValidatorFunction';

export type Validator<T extends Record<string, unknown>> = {
    validate: {
        [Prop in keyof T]: ValidatorFunction<T> | ValidatorFunction<T>[];
    };
};
