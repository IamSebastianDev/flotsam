/** @format */

import { FindOptions, Document } from '../../types';

export const evaluateFindOptions = <T extends Record<string, unknown>>(
    document: Document<T>,
    findOptions: FindOptions<T>
) => {
    return Object.entries(findOptions).every(([prop, evaluator]) => evaluator(document[prop]));
};
