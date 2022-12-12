/** @format */

export type ValidatorFunction = <T, K>(value: T, propName?: string, document?: K) => boolean;
