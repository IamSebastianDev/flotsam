/** @format */

/**
 * @type { Function }
 * @description
 * Subscriber function to pass to the `on` method of Flotsam, used as handler
 * during th emitting of events.
 */
export type Subscriber = (...args: any[]) => void;
