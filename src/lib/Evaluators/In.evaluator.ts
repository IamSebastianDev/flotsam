/** @format */

import { EvaluatorFunction } from '../../types';
import { isNonNull } from '../../utils';

export const In = (condition: Array<unknown>): EvaluatorFunction => {
    return (value: unknown, propName?: string) => {
        if (!isNonNull(value)) {
            throw new TypeError(`[Query] Property ${propName} is null or undefined.`);
        }

        return condition.findIndex((e) => e == value) !== -1;
    };
};
