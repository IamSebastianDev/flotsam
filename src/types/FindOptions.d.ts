/** @format */

import { EvaluatorFunction } from './EvaluatorFunction';

export type FindOptions<T> = {
    [Prop in keyof T]: EvaluatorFunction;
};
