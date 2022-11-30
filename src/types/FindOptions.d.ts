/** @format */

import { EvaluatorFunction } from './EvaluatorFunction';
import { FindByProperty } from './FindByProperty';

export type FindOptions<T> = {
    where: FindByProperty<Partial<T>> | FindByProperty<Partial<T>>[];
    order?: {
        property: keyof T | '_id';
        by: 'ASC' | 'DESC';
    };
    skip?: number;
    take?: number;
    limit?: number;
};
