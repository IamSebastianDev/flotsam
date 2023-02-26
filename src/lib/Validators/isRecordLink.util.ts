/** @format */

import { RecordLink } from '../../types';
import { ObjectId } from '../Db/ObjectId';

export const isRecordLink = (value: unknown): value is RecordLink => {
    if (typeof value !== 'string') return false;

    const [namespace, id] = value.split(':');

    return !!(namespace && id && ObjectId.is(id));
};
