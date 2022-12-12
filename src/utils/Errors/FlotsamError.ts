/** @format */

export class FlotsamError extends Error {
    public reported: boolean = false;
    public rethrows: boolean = false;

    constructor(message: string) {
        super(message);
    }

    static is(error: unknown): error is FlotsamError {
        return error instanceof FlotsamError;
    }

    static current(error: unknown) {
        return error instanceof FlotsamError && !error.reported;
    }
}
