/** @format */

import { EvaluatorFunction } from './EvaluatorFunction';
import { FindByProperty } from './FindByProperty';

export type FindOptions<T> = {
    where: FindByProperty<T> | FindByProperty<T>[];
    order?: {
        property: string;
        by: 'ASC' | 'DESC';
    };
    skip?: number;
    take?: number;
};
