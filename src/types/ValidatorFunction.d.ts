/** @format */

export type ValidatorFunction = <T>(value: unknown, propName?: string, document?: T) => boolean;
