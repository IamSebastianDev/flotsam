/** @format */

import { RecordLink } from '../../types';
import { FlotsamError } from '../../utils/Errors/FlotsamError';
import { Collection } from './Collection';
import { ObjectId } from './ObjectId';

/**
 * @description
 * Method to create a **Record Link** token from a Collection and an Id.
 *
 * @param { string | Collection } collection - the namespace of a Collection or a Collection instance
 * @param { ObjectId } recordId
 * @returns
 */

export const Link = <T, K extends Record<PropertyKey, unknown>>(
    collection: T | Collection<K>,
    recordId: string | ObjectId
): RecordLink<T> => {
    let namespace = collection;

    if (collection instanceof Collection && 'namespace' in collection) {
        namespace = collection.namespace as T;
    }

    let id = recordId instanceof ObjectId ? recordId.valueOf() : ObjectId.is(recordId) ? recordId : null;

    if (!id || !namespace) {
        throw new FlotsamError(`Incorrect arguments supplied to create a valid Record Link Token.`);
    }

    return `${namespace}:${id}` as RecordLink<T>;
};
