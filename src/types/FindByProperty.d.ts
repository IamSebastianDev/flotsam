/** @format */

import { EvaluatorFunction } from './EvaluatorFunction';

export type FindByProperty<T> = {
    [Prop in keyof T]: T[Prop] | EvaluatorFunction<T[Prop], T>;
};
