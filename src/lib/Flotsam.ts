/** @format */

import { mkdir, readdir, rmdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { __root } from '../utils';
import { FlotsamInit, FlotsamEvent, Unsubscriber, Subscriber } from '../types';
import { Collection } from './Collection';

export class Flotsam {
    /**
     * @type { string }
     * @description
     * The absolute path of the directory to use as storage for the json documents
     */
    root: string;

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

    auth: string | null;

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
        this.root = __root(init.root);
        this.auth = init.auth || null;
        this.connected = false;
    }

    /**
     * @description
     * Method to initialize the Database. Check if the physical storage
     * directory exists, and if not, create the necessary directories
     * recursively.
     *
     * ```ts
     * import { Flotsam } from "flotsam";
     *
     * const db = new Flotsam({ root: './.store' });
     * await db.connect();
     * ```
     *
     * @returns { Promise<boolean> } `true` if the connection is established
     */

    async connect(): Promise<boolean> {
        return new Promise(async (res, rej) => {
            try {
                /**
                 * Check if the root dir passed in the initialization
                 * object exists, if not create it.
                 */

                if (!existsSync(this.root)) {
                    await mkdir(this.root, { recursive: true });
                }

                this.emit('connect');
                res(true);
            } catch (e) {
                this.emit('error', e);
                rej(e);
            }
        });
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
     * @returns { Collection } the deserialized Collection containing the entries stored
     * previously.
     */

    async collect<T extends Record<string, unknown>>(namespace: string): Promise<Collection<T>> {
        if (!this.#collections[namespace]) {
            this.#collections[namespace] = new Collection<T>(this, namespace);
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

    async jettison(namespace: string, soft: boolean = false): Promise<boolean> {
        if (!this.#collections[namespace]) return false;

        if (!soft) {
            await this.#collections[namespace].jettison();
        }

        delete this.#collections[namespace];
        return true;
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
