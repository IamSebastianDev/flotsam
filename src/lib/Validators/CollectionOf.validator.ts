/** @format */

import { RecordLink, ValidatorFunction } from '../../types';
import { FlotsamValidationError } from '../../utils';
import { Collection, ObjectId } from '../Db';
import { isRecordLink } from './isRecordLink.util';

export const CollectionOf = (collection: string | Collection<Record<PropertyKey, unknown>>): ValidatorFunction => {
    let namespace = collection;

    if (collection instanceof Collection && 'namespace' in collection) {
        namespace = collection.namespace;
    }

    return <T, K>(value: unknown, propertyName?: string, document?: K) => {
        // skip null or undefined values by default
        if (value === null || value === undefined) {
            return true;
        }

        if (!Array.isArray(value)) {
            throw new FlotsamValidationError(
                `Expected property '${propertyName}' to be of type 'Array'. Found property to be of type '${typeof value}' instead.`
            );
        }

        if (Array.isArray(value)) {
            return value.every((entry, index) => {
                if (isRecordLink(entry)) {
                    const [parsedNamespace, id] = entry.split(':');

                    if (!ObjectId.is(id)) {
                        throw new FlotsamValidationError(
                            `Expected property '${propertyName}'[${index}] to be a valid RecordLink of Collection '${namespace}'.`
                        );
                    }

                    return parsedNamespace === namespace && ObjectId.is(id);
                }

                throw new FlotsamValidationError(
                    `Expected property '${propertyName}'[${index}] to be a valid RecordLink Token.`
                );
            });
        }

        return true;
    };
};
