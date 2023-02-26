/** @format */

import { RecordLink, ValidatorFunction } from '../../types';
import { FlotsamValidationError } from '../../utils';
import { Collection, ObjectId } from '../Db';
import { isRecordLink } from './isRecordLink.util';

export const RecordFrom = (collection: string | Collection<Record<PropertyKey, unknown>>): ValidatorFunction => {
    let namespace = collection;

    if (collection instanceof Collection && 'namespace' in collection) {
        namespace = collection.namespace;
    }

    return <T, K>(value: unknown, propertyName?: string, document?: K) => {
        // skip null or undefined values by default
        if (value === null || value === undefined) {
            return true;
        }

        if (isRecordLink(value)) {
            const [parsedNamespace, id] = value.split(':');

            if (!ObjectId.is(id)) {
                throw new FlotsamValidationError(
                    `Expected property '${propertyName}' to be a valid RecordLink of Collection '${namespace}'.`
                );
            }

            return parsedNamespace === namespace && ObjectId.is(id);
        }

        return false;
    };
};
