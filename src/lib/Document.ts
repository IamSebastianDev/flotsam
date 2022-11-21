/** @format */
import { ObjectId } from './ObjectId';

export class Document<T extends Record<string, unknown>> {
    #id: ObjectId;
    constructor(private data: T) {
        this.#id = this.data.id ? ObjectId.from(this.data.id as string) : new ObjectId();
    }
}
