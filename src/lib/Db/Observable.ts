/** @format */

import { Handler, SetterFunction, Subscription, Subscriber, MapFunction } from '../../types';
import { FlotsamObservableError } from '../../utils';
import { ObjectId } from './ObjectId';

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

        this.#subscribers.forEach(({ handlerFunction }) => {
            handlerFunction(this.#$!, previousValue);
        });
    }

    next(value: T) {
        const previousValue = this.#$;
        this.#$ = value;
        this.notifySubscribers(previousValue);
    }

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
            handlerFunction: (value, previousValue) => {
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

    map<E>(mapper: MapFunction<T, E>): Observable<E> {
        const observer = new Observable<E>();

        this.#subscribers.push({
            subscriptionId: new ObjectId(),
            handlerFunction: (value) => observer.next(mapper(value)),
        });

        return observer;
    }

    complete() {
        this.#completed = true;
        this.#subscribers = [];

        if (this.#onComplete) {
            this.#onComplete(this);
        }
    }

    onComplete(callback: (ctx: this) => void) {
        this.#onComplete = callback;
    }
}
