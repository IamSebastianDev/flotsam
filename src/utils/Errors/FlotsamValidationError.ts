/** @format */

import { FlotsamError } from './FlotsamError';

export class FlotsamValidationError extends FlotsamError {
    public name: string = 'FlotsamValidationError';
    public reported: boolean = false;

    constructor(message: string) {
        super(`\x1b[31m[Error][Validator]\x1b[0m ${message}`);
    }
}
