/** @format */

import { Handler, SetterFunction, Subscription, Subscriber, MapFunction } from '../../types';
import { FlotsamObservableError } from '../../utils';
import { ObjectId } from './ObjectId';

/**
 * Simple Observable implementation with `next`, `subscribe` and `map` methods.
 */

export class Observable<T> {
    #completed: boolean = false;
    #$!: T;
    #subscribers: Handler<T>[] = [];
    #onComplete?: (ctx: this) => void;

    constructor(value?: T, setter?: SetterFunction<T>) {
        if (value) {
            this.#$ = value;
        }

        if (setter && typeof setter === 'function') {
            this.#$ = setter();
        }
    }

    private notifySubscribers(previousValue: T) {
        if (this.#$ === undefined) {
            return;
        }

        this.#subscribers.forEach(({ action }) => {
            action(this.#$, previousValue);
        });
    }

    /**
     * @description
     * Method to set the new value of the Observable. This will emit to
     * all Subscribers of the Observable.
     *
     * @param { T } value - the value to set the Observable to.
     */

    next(value: T) {
        const previousValue = this.#$;
        this.#$ = value;
        this.notifySubscribers(previousValue);
    }

    /**
     * Method to register a Subscriber on the Observable. The provided Subscriber will be notified
     * when the Observable emits with the new & previous Value of the Observable.
     *
     * @param { Subscription<T> } subscriber - the action to execute when the observable emits.
     * @returns { Subscriber<T> } a Subscriber
     */

    subscribe(subscriber: Subscription<T>): Subscriber<T> {
        if (this.#completed) {
            throw new FlotsamObservableError(
                'The Observable has already completed and does no longer accept subscribers.'
            );
        }

        let disposeAfterEmit = false;
        const subscriptionId = new ObjectId();

        const dispose = () => {
            const index = this.#subscribers.findIndex((handler) =>
                ObjectId.compare(subscriptionId, handler.subscriptionId)
            );

            if (index !== -1) {
                this.#subscribers.splice(index, 1);
            }
        };

        const once = () => {
            disposeAfterEmit = true;
        };

        this.#subscribers.push({
            subscriptionId,
            action: (value, previousValue) => {
                subscriber(value, previousValue);

                if (disposeAfterEmit) {
                    dispose();
                }
            },
        });

        return {
            dispose,
            once,
        };
    }

    /**
     * @description
     * Method to create a new Observable that will emit when the Source Observable
     * emits and transforms the with a mapper function.
     *
     * @param { MapFunction<T, E> } mapper - Function to transform the value emitted by the
     * source Observable.
     * @returns { Observable<E> }
     */

    map<E>(mapper: MapFunction<T, E>): Observable<E> {
        const observer = new Observable<E>();

        this.#subscribers.push({
            subscriptionId: new ObjectId(),
            action: (value) => observer.next(mapper(value)),
        });

        return observer;
    }

    /**
     * @description
     * Method to complete the Observable. All Subscribers will be deleted and the
     * Observable will no longer be able to emit. If a `onComplete()` callback is
     * registered, it will be called.
     */

    complete() {
        if (this.#completed) return;

        this.#completed = true;
        this.#subscribers = [];

        if (this.#onComplete) {
            this.#onComplete(this);
        }
    }

    /**
     * @description
     * Method to register a completion callback on the Observable.
     *
     * @param callback - the callback to execute when the Observable completes
     */

    onComplete(callback: (ctx: this) => void) {
        this.#onComplete = callback;
    }
}
