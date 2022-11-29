/** @format */

import { EvaluatorFunction } from './EvaluatorFunction';
import { FindByProperty } from './FindByProperty';

export type FindOptions<T> = {
    where: FindByProperty<Partial<T>> | FindByProperty<Partial<T>>[];
    order?: {
        property: string;
        by: 'ASC' | 'DESC';
    };
    skip?: number;
    take?: number;
};
