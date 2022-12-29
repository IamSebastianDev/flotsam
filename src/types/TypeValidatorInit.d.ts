/** @format */

import { Primitive } from './Primitive';
import { ValidatorFunction } from './ValidatorFunction';

export type TypeValidatorInit = {
    type: Primitive | ValidatorFunction;
};
