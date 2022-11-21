/** @format */

import fs from 'node:fs';
import { __root } from '../utils';
import { FlotsamInit, FlotsamEvent, Unsubscriber, Subscriber } from '../types';
import { Collection } from './Collection';

export class Flotsam {
    /**
     * @type { string }
     * @private
     * @description
     * The absolute path of the directory to use as storage for the json documents
     */
    /**
     * @type { boolean }
     * @description
     * Boolean indicating if the database has been connected successfully.
     */
    connected: boolean;

    /**
     * @type { Record<string, Collection<any>> }
     * @private
     * @description
     * Object holding all deserialized collections
     */

    #collections: Record<string, Collection<any>> = {};

    #handlers: Record<FlotsamEvent, Array<Subscriber>> = {
        close: [() => (this.connected = false)],
        delete: [],
        deserialize: [],
        drop: [],
        insert: [],
        connect: [() => (this.connected = true)],
        serialize: [],
        update: [],
        upsert: [],
        error: [],
    };
    constructor(init: FlotsamInit) {
        this.#root = __root(init.root);
    }

    /**
     * @description
     * Method to retrieve a Collection from the database. The collection is
     * deserialized from the filesystem and cached.
     *
     * ```ts
     * type User = { name: string; age: number }
     *
     * const users = await db.collect<User>('users');
     * // users: Collection<User>
     *
     * users.findOneBy({ id: 1 })
     * // returns a User with the id `1`
     *
     * users.insertOne({ name: 'Flotsam', age: 100 })
     * // return a `Document<User>` object.
     * ```
     *
     * @param { string } namespace - the namespace of the collection to retrieve.
     * @returns { Collection } - the deserialized Collection containing the entries stored
     * previously.
     */

    async collect<T extends Record<string, unknown>>(namespace: string): Promise<Collection<T>> {
        if (!this.#collections[namespace]) {
            this.#collections[namespace] = new Collection<T>(namespace);
            await this.#collections[namespace].deserialize();
        }
        return this.#collections[namespace];
    }

    /**
     * @description
     * Method to remove a collection from the physical storage directory or just the collection cache.
     *
     * @param { string } namespace - the namespace of the collection to drop.
     * @param { boolean } [soft] - optional boolean indicating if the physical documents should be kept.
     * @returns { Promise<boolean> } - true if the collection was successfully dropped.
     */

    async drop(namespace: string, soft?: boolean): Promise<boolean> {
        return await this.#collections[namespace].drop(soft);
    }

    /**
     * @description
     * Method to gracefully shut down the database. Calling the `close` method will
     * serialize all remaining `Collections`.
     */

    async close(): Promise<void> {
        this.emit('close');
        Object.values(this.#collections).forEach(async (collection) => {
            await collection.serialize();
        });
    }

    /**
     * @description
     * Method to subscribe to an event emitted by Flotsam during operation.
     *
     * ```ts
     * const db = new Flotsam();
     * db.on('close', () => { // do something })
     * ```
     *
     * @param { FlotsamEvent } event - the event to subscribe to.
     * @param { Subscriber } handler - the callback to execute when the event is emitted.
     * @returns { Unsubscriber } a function to unsubscribe and cleanup the subscriber.
     */

    on(event: FlotsamEvent, handler: Subscriber): Unsubscriber {
        this.#handlers[event].push(handler);

        return () => {
            this.#handlers[event] = this.#handlers[event].filter((h) => h !== handler);
        };
    }

    /**
     * @description
     * Method to trigger callbacks registered via the `on` method.
     *
     * @param { FlotsamEvent } event - the eventname to emit.
     * @param { any[] } args - optional arguments that are relayed to the handler function.
     */

    emit(event: FlotsamEvent, ...args: any[]): void {
        this.#handlers[event].forEach((handler) => handler(...args));
    }
}
