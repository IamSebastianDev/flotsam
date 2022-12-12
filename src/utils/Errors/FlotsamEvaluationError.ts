/** @format */

import { FlotsamError } from './FlotsamError';

export class FlotsamEvaluationError extends FlotsamError {
    public name: string = 'FlotsamEvaluationError';
    public rethrows: boolean = true;

    constructor(message: string) {
        super(`\x1b[31m[Error][Query]\x1b[0m ${message}`);
    }
}
