/** @format */
import { DocumentInit } from '../types';
import { ObjectId } from './ObjectId';

export class Document<T extends Record<string, unknown>> {
    #id: ObjectId;
    constructor(private data: DocumentInit<T>) {
        this.#id = this.data._id ? ObjectId.from(this.data._id) : new ObjectId();
    }

    toFile() {
        return JSON.stringify(this.data._);
    }

    toObject(): T & { _id: ObjectId } {
        return { ...this.data._, _id: this.#id };
    }
}
