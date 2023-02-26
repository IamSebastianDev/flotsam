/** @format */

import { FlotsamError } from './FlotsamError';

export class FlotsamObservableError extends FlotsamError {
    public name: string = 'FlotsamObservableError';

    constructor(message: string) {
        super(`\x1b[31m[Error][Observable]\x1b[0m ${message}`);
    }
}
