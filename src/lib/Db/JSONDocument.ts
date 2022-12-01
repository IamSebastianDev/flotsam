/** @format */
import { DocumentInit, Document } from '../../types';
import { ObjectId } from './ObjectId';

export class JSONDocument<T extends Record<string, unknown>> {
    data: T;
    _id: ObjectId;
    constructor(data: DocumentInit<T>) {
        this._id = data._id ? ObjectId.from(data._id) : new ObjectId();
        delete data._._id;
        this.data = { ...data._ };
    }

    /**
     * @public
     * @method
     * @description
     * Method to convert the internal data of the `JSONDocument` into a JSON
     * encoded string to store inside a serialized file.
     *
     * @returns { string } the JSON encoded string to store as file
     */

    toFile(): string {
        return JSON.stringify({ _id: this._id.str, _: this.data });
    }

    /**
     * @public
     * @method
     * @description
     * Method to convert the internal data of the `JSONDocument` into a JS Object containing
     * data and the exposed id
     *
     * @returns { string } the JSON encoded string to store as file
     */

    toDoc(): Document<T> {
        return { ...this.data, _id: this._id };
    }
}
