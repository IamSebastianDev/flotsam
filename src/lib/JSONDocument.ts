/** @format */
import { DocumentInit, Document } from '../types';
import { ObjectId } from './ObjectId';

export class JSONDocument<T extends Record<string, unknown>> {
    #id: ObjectId;
    constructor(private data: DocumentInit<T>) {
        this.#id = this.data._id ? ObjectId.from(this.data._id) : new ObjectId();
    }

    get id() {
        return this.#id;
    }

    toFile() {
        return JSON.stringify({ _id: this.#id.str, _: this.data._ });
    }

    toDoc(): Document<T> {
        return { ...this.data._, _id: this.#id };
    }
}
