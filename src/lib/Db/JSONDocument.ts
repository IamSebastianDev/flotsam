/** @format */
import { DocumentInit, Document, Validator } from '../../types';
import { evaluateValidationStrategy } from './evaluateValidationStrategy';
import { ObjectId } from './ObjectId';

/**
 * @description
 * The `JSONDocument` class is used to represent instances of `Documents` inside a `Collection`.
 */
export class JSONDocument<T extends Record<PropertyKey, unknown>> {
    data: T;
    _id: ObjectId;
    constructor(data: DocumentInit<T>, private validationStrategy?: Validator<T>) {
        // pass the data to the validation method
        this.validateData(data._);

        this._id = data._id ? ObjectId.from(data._id) : new ObjectId();
        delete data._._id;

        this.data = { ...data._ };
    }

    private validateData(data: T) {
        if (!this.validationStrategy) return;
        evaluateValidationStrategy(data, this.validationStrategy);
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
        return {
            ...this.data,
            _id: this._id,
            get id() {
                return this._id.str;
            },
        };
    }
}
