/** @format */

export type ObservedQuery<T extends Record<PropertyKey, unknown>, E> = (collection: Collection<T>) => E;
