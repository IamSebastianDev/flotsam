/** @format */

import type { Primitive } from './Primitive';
import { ValidatorFunction } from './ValidatorFunction';

export type ArrayValidatorInit = {
    min?: number;
    max?: number;
    items?: Primitive | ValidatorFunction | ValidatorFunction[];
};
