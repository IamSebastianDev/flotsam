/** @format */

import { ObjectId } from '../lib';

export type Document<T> = T & { _id: ObjectId };
