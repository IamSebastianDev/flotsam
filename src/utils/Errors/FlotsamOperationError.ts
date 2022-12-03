/** @format */

export class FlotsamOperationError extends Error {
    public name: string = 'FlotsamOperationError';

    constructor(message: string) {
        super(`[Error][Flotsam] ${message}`);
    }
}
