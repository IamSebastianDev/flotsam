/** @format */

export type EvaluatorFunction = <T = unknown, K extends Record<string, unknown>>(
    value: T,
    propertyName?: string,
    document?: K
) => boolean;
