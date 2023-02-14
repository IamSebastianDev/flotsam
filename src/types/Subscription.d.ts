/** @format */

/**
 * @description
 * Function passed to the `subscribe()` method of a Observable to call
 * whenever the Observable emits. Accepts the value and previous value of
 * the Observable.
 */

export type Subscription<T> = (value: T, previousValue?: T) => void;
