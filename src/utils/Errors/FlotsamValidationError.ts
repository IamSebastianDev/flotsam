/** @format */

export class FlotsamValidationError extends Error {
    public name: string = 'FlotsamValidationError';

    constructor(message: string) {
        super(`[Error][Validator] ${message}`);
    }
}
