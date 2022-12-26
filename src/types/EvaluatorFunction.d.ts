/** @format */

export type EvaluatorFunction = <T, K extends Record<string, unknown>>(
    value: T,
    propertyName?: string,
    document?: K
) => boolean;
