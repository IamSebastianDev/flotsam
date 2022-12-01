/** @format */

/**
 * @utility
 * @description
 * Utility function to check if a value is neither `null` nor `undefined`.
 *
 * @param { unknown} value - the value to check.
 * @returns {Boolean} a boolean indicating if the value is null or undefined.
 */

export const isNonNull = (value: unknown): boolean => value !== null && value !== undefined;
