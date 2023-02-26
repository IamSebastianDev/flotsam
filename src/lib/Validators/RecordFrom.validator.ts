/** @format */

import { RecordLink, ValidatorFunction } from '../../types';
import { FlotsamValidationError } from '../../utils';
import { Collection, ObjectId } from '../Db';
import { isRecordLink } from './isRecordLink.util';

/**
 * @description
 * Validator to check a given value to be inserted or updated for being an a valid **Record Link Token**.
 *
 * -----
 *@example
 * ```ts
 * import { Flotsam } from "flotsam/db";
 * import { NotNull, RecordFrom } from "flotsam/validators";
 *
 * const collection = await db.collect<{ user: User }>('collection', {
 *      validate: {
 *          user: [NotNull, RecordFrom('User')]
 *      }
 * });
 *
 * ```
 * -----
 *
 * @param { string | Collection } collection - the namespace of a Collection or a Collection Instance to link.
 * @returns { ValidatorFunction } a ValidatorFunction to validate Record Link Tokens
 */

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

        throw new FlotsamValidationError(`Expected property '${propertyName}' to be a valid RecordLink.`);
    };
};
