/** @format */

export type Subscription<T> = (value: T, previousValue?: T) => void;
