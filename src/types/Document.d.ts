/** @format */

import { ObjectId } from '../lib';

/**
 * @type { Document }
 * @description
 * A Document is the combination of it's generic Data `T` and the associated `ObjectId`
 */

export type Document<T> = T & { _id: ObjectId; readonly id: string };
