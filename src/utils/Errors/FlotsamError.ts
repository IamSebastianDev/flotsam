/** @format */

export class FlotsamError extends Error {
    public reported: boolean = false;

    constructor(message: string) {
        super(message);
    }

    static validate(error: unknown): error is FlotsamError {
        return error instanceof FlotsamError && !error.reported;
    }
}
