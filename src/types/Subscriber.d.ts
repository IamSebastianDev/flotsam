/** @format */

/**
 * @description
 * A Subscriber returned by the `subscribe()` method of an Observable.
 * The Subscriber contains two methods to control the Subscription.
 * `dispose()` will remove the Subscriber from the Observable and end the
 * subscription.
 * `once()` will dispose the Subscriber after the next emit of the Observable.
 */

export type Subscriber<T> = {
    /**
     * @description
     * Method to dispose the created Subscriber.
     */

    dispose: () => void;

    /**
     * @description
     * Method to dispose the Subscriber after the next emit
     * of the Source Observable.
     */

    once: () => void;
};
