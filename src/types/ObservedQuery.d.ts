/** @format */

import { ObjectId } from '../lib';
import { Observable } from '../lib/Db';
import { Document } from './Document';
import { FindOptions } from './FindOptions';

export type ObservedQuery<T> = {
    queryId: ObjectId;
    queryObserver: Observable<Document<T>[]>;
    findOptions: FindOptions<T>;
};
