/** @format */

const chars = [...'abcdefghijklmnopqrstuvwxyz0123456789'];

export class ObjectId {
    /**
     * @static
     * @description
     * Static method to convert a raw string into an ObjectId. The string should conform
     * to the ObjectId format of
     * @param { string } raw - a raw string to convert to an ObjectId
     * @returns { ObjectId } the newly created ObjectId
     */

    static from(raw: string): ObjectId {
        ObjectId.is(raw);
        const [timestamp, unique] = raw.split('$');

        const id = new ObjectId();
        id.timestamp = timestamp;
        id.#unique = unique;

        return id;
    }

    /**
     * @static
     * @throws
     * @description
     * Static method to check if a given value can be converted to an ObjectId.
     * Throws an error if the passed value does not conform to the needed format.
     *
     * @param { unknown } value - the value to check for being an ObjectId
     * @returns { boolean } true if the value is a string that can be converted to an ObjectId
     */

    static is(value: unknown): boolean {
        if (typeof value !== 'string') {
            throw new TypeError(`[ObjectId] Value "${value}" is of type ${typeof value}. Expected type string.`);
        }

        const [timestamp, unique] = value.split('$');

        if (!value.includes('$')) {
            throw new Error(`[ObjectId] Value "${value}" is not in the correct format.`);
        }

        if (!timestamp || !/[0-9]{6,6}/g.test(timestamp)) {
            throw new Error(
                `[ObjectId] Value "${value}" is not in the correct format. 'Timestamp' is missing or of incorrect length or NaN.`
            );
        }

        if (!unique || !/[aA-zZ0-9]{24,24}/.test(unique)) {
            throw new Error(
                `[ObjectId] Value "${value}" is not in the correct format. 'Unique' is missing or of incorrect length.`
            );
        }

        return true;
    }

    /**
     * @static
     * @description
     * Static method to compare two ObjectIds for equality
     *
     * @param { ObjectId } actual
     * @param { ObjectId } toCompare
     * @returns { boolean } a boolean indicating if the two ObjectIds match.
     */

    static compare(actual: ObjectId, toCompare: ObjectId): boolean {
        return actual.str === toCompare.str;
    }

    #timestamp: string = this.createTimestamp();
    #unique: string = this.createUnique();

    private getRandomCharIndex(ceil: number): number {
        return Math.floor(Math.random() * ceil) * 1;
    }

    private convertToUppercase(char: string) {
        return [char, char.toUpperCase()];
    }

    private createTimestamp(): string {
        return Date.now().toString().slice(-7, -1).padStart(6, '7');
    }

    private createUnique(): string {
        const uniqueChars = [...new Set(chars.flatMap(this.convertToUppercase))];
        return Array.apply(null, Array(24))
            .map(() => uniqueChars[this.getRandomCharIndex(uniqueChars.length)])
            .join('');
    }

    /**
     * @type { string }
     * @description
     * The added timestamp of the ObjectId to increase uniqueness.
     */

    set timestamp(value: string) {
        this.#timestamp = value.slice(0, 6).padEnd(6, '7');
    }

    get timestamp(): string {
        return this.#timestamp;
    }

    /**
     * @type { string }
     * @description
     * The unique identifier part of the ObjectId.
     */

    public set unique(value: string) {
        this.#unique = value.slice(0, 16);
    }

    public get unique(): string {
        return this.#unique;
    }

    private get id(): string {
        return this.#timestamp + '$' + this.#unique;
    }

    /**
     * @type { string }
     * @description
     * Return the Id of the ObjectId as string.
     */

    public get str(): string {
        return this.id;
    }

    /**
     * @description
     * Method to retrieve the ObjectId as a string.
     * @returns { string } the id string of the ObjectId.
     */
    public valueOf(): string {
        return this.str;
    }
}
