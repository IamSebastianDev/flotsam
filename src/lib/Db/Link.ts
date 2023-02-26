/** @format */

import { RecordLink } from '../../types';
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

export const Link = (collection: string | Collection<Record<PropertyKey, unknown>>, recordId: ObjectId): RecordLink => {
    let namespace = collection;

    if (collection instanceof Collection && 'namespace' in collection) {
        namespace = collection.namespace;
    }

    return `${namespace}:${recordId.valueOf()}`;
};
