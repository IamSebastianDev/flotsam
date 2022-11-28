/** @format */
import { CipherKey, createCipheriv, createDecipheriv, createHash, randomBytes, BinaryLike } from 'crypto';

export class Crypto {
    #algorithm = 'aes-256-cbc';
    #vectorLength = 16;
    constructor(private _key: string) {}

    get key(): CipherKey {
        return createHash('sha256').update(this._key).digest('base64').substring(0, 32);
    }

    encrypt(string: string): string {
        console.log({ string });
        const vector = randomBytes(16);
        const cipher = createCipheriv(this.#algorithm, this.key, vector);
        const encrypted = Buffer.concat([cipher.update(string), cipher.final()]);

        return JSON.stringify({
            vector: vector.toString('hex'),
            content: encrypted.toString('hex'),
        });
    }

    decrypt(string: string): string {
        const { content, vector } = JSON.parse(string);
        const decipher = createDecipheriv(this.#algorithm, this.key, Buffer.from(vector, 'hex'));

        return Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]).toString();
    }
}
