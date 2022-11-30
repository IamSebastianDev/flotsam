/** @format */

import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { __root } from '../utils';
import { FlotsamInit, FlotsamEvent, Unsubscriber, Subscriber, Callback, ErrorHandler } from '../types';
import { Collection } from './Collection';
import { Loq } from './Loq';
import { Queue } from './Queue';

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
    connected: boolean = false;

    /**
     * @type { Record<string, Collection<any>> }
     * @private
     * @description
     * Object holding all deserialized collections
     */

    #collections: Record<string, Collection<any>> = {};

    auth?: string;

    quiet?: boolean = true;

    log?: string;

    #loq: Loq = new Loq(this);

    #queue: Queue = new Queue();

    #handlers: Record<FlotsamEvent, Array<Subscriber>> = {
        close: [],
        delete: [],
        deserialize: [],
        drop: [],
        insert: [],
        connect: [],
        serialize: [],
        update: [],
        upsert: [],
        error: [],
    };

    constructor(init: FlotsamInit) {
        this.root = __root(init.root);
        this.auth = init.auth;
        this.quiet = init.quiet;
        this.log = init.log;

        this.createInitialListeners();
    }

    private createInitialListeners() {
        this.on('error', (error) => {
            return this.#queue.enqueue(
                new Promise((res) => {
                    return res(this.#loq.error(error));
                })
            );
        });

        this.on('connect', () => {
            return this.#queue.enqueue(
                new Promise((res) => {
                    return res(this.#loq.message('[Flotsam] Connected'));
                })
            );
        });

        this.on('connect', () => {
            this.connected = true;
            !this.quiet && console.log(`🐙 \x1b[34m[Flotsam] DB Connected.\x1b[0m`);
        });

        this.on('close', () => {
            return this.#queue.enqueue(
                new Promise((res) => {
                    return res(this.#loq.message('[Flotsam] Closed'));
                })
            );
        });

        this.on('close', () => {
            this.connected = false;
            !this.quiet && console.log(`🪢  \x1b[34m[Flotsam] DB Closed.\x1b[0m`);
        });
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
     * @param { Callback | null } [callback] - optional callback that will be executed when the connection is completed.
     * @param { ErrorHandler } [error] - optional error callback that will be executed when the connection fails.
     *
     * @returns { Promise<boolean> } `true` if the connection is established
     */

    async connect(callback?: Callback | null, error?: ErrorHandler): Promise<boolean> {
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
                if (callback && typeof callback === 'function') callback();
                res(true);
            } catch (e) {
                this.emit('error', e);
                if (error && typeof error === 'function') error(e);
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
