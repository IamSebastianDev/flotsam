/** @format */

import type { ValidatorFunction } from './ValidatorFunction';

export type ValidationStrategy<T extends Record<string, unknown>> = {
    [Prop in keyof T]: ValidatorFunction | ValidatorFunction[];
};
