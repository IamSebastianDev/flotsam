/** @format */

import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { FlotsamOperationError, __root, isSafeCharacter } from '../../utils';
import {
    FlotsamInit,
    FlotsamEvent,
    Unsubscriber,
    Callback,
    ErrorHandler,
    Validator,
    HandlerFunction,
    FlotsamStorageInit,
    FlotsamAuthInit,
    FlotsamLogInit,
    ConnectionSettings,
} from '../../types';
import { Collection } from './Collection';
import { Loq } from './Loq';
import { Queue } from './Queue';
import { platform, homedir, type } from 'node:os';
import { join, resolve } from 'node:path';

/**
 * @description
 * The `Flotsam` class is the main interface for using the database. All operations concerning the
 * creation or removing of collections happens using a created `Flotsam` instance.
 *
 * @example
 * ```ts
 * import { Flotsam } from "flotsam/db";
 *
 * // Flotsam is designed to work without configuration
 * // by using a sensible set of default settings
 * const db = new Flotsam()
 *
 * // connect to the database to ensure that the necessary setup
 * // operations are performed. You need to provide a
 * // Name for the database that is created / used.
 * await db.connect('flotsam');
 *
 * // creating a typed collection
 * const collection = await db.collect<{name: string}>('collection')
 * ```
 */

export class Flotsam {
    _storage: FlotsamStorageInit = {};
    _auth?: FlotsamAuthInit;
    _log: FlotsamLogInit = {};
    _connectionSettings!: ConnectionSettings;

    /**
     * @type { string }
     * @description
     * The absolute path of the directory to use as storage for the json documents
     */
    get root(): string {
        const { databaseName } = this._connectionSettings;

        return this._storage.useProjectStorage
            ? __root(this._storage.dir || '', databaseName)
            : resolve(this._storage.dir || Flotsam.RootStorageDirectory, databaseName);
    }

    /**
     * @type { boolean }
     * @description
     * Boolean indicating if the database has been connected successfully.
     */
    connected: boolean = false;

    /**
     * @type { Record<PropertyKey, Collection<any>> }
     * @private
     * @description
     * Object holding all deserialized collections
     */

    collections: Record<PropertyKey, Collection<any>> = {};

    #loq: Loq = new Loq(this);
    #queue: Queue = new Queue();
    #handlers: Record<FlotsamEvent, Array<HandlerFunction>> = {
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

    constructor(init: FlotsamInit = {}) {
        Object.assign(
            this,
            Object.fromEntries(
                Object.entries(init).map(([key, value]) => {
                    return [`_${key}`, value];
                })
            )
        );

        this.createInitialListeners();
    }

    /**
     * @description
     * Method to setup the initial `Flotsam` listeners.
     */

    private createInitialListeners() {
        process.on('uncaughtException', (error) => {
            this.close().then(() => {
                process.exit(1);
            });
        });

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
            !this._log?.quiet && console.log(`🐙 \x1b[32m[Flotsam] DB Connected.\x1b[0m`);
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
            !this._log?.quiet && console.log(`🐙 \x1b[32m[Flotsam] DB Closed.\x1b[0m`);
        });
    }

    private parseConnectionSettings(connectionSettings: ConnectionSettings | string): ConnectionSettings {
        let databaseName =
            typeof connectionSettings === 'string' ? connectionSettings : connectionSettings.databaseName;

        if (![...databaseName].every(isSafeCharacter)) {
            throw new FlotsamOperationError('Connection string contains invalid characters.');
        }

        return { ...(typeof connectionSettings === 'string' ? {} : connectionSettings), databaseName };
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
     * @param { ConnectionSettings | string } connection - either a connection settings object or a string used as database name.
     * @param { Callback | null } [callback] - optional callback that will be executed when the connection is completed.
     * @param { ErrorHandler } [error] - optional error callback that will be executed when the connection fails.
     *
     * @returns { Promise<boolean> } `true` if the connection is established
     */

    async connect(
        connection: ConnectionSettings | string,
        callback?: Callback | null,
        error?: ErrorHandler
    ): Promise<boolean> {
        if (this.connected) {
            const e = new FlotsamOperationError('Already connected.');
            this.emit('error', e);
            if (error && typeof error === 'function') error(e);
        }

        this._connectionSettings = this.parseConnectionSettings(connection);

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

    async collect<T extends Record<string, unknown>>(
        namespace: string,
        validationStrategy?: Validator<T>
    ): Promise<Collection<T>> {
        if (!this.connected) {
            this.emit('error', `🐙 \x1b[31m[Flotsam] Attempted collecting before connecting.\x1b[0m`);
        }

        if (!this.collections[namespace]) {
            this.collections[namespace] = new Collection<T>(this, namespace, validationStrategy);
            await this.collections[namespace].deserialize();
        }

        return this.collections[namespace];
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
        if (!this.collections[namespace]) return false;

        if (!soft) {
            await this.collections[namespace].jettison();
        }

        delete this.collections[namespace];
        return true;
    }

    /**
     * @description
     * Method to gracefully shut down the database. Calling the `close` method will
     * serialize all remaining `Collections`.
     */

    async close(): Promise<void> {
        await Promise.allSettled(
            Object.values(this.collections).map(async (collection) => {
                return await collection.serialize();
            })
        );
        this.emit('close');
        this.connected = false;
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

    on(event: FlotsamEvent, handler: HandlerFunction): Unsubscriber {
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

    static get RootStorageDirectory(): string {
        switch (platform()) {
            case 'darwin':
                return join(homedir(), 'Library', 'Application Support', '.flotsam');
            case 'win32':
                return join(process.env.APPDATA || process.env.LOCALAPPDATA || process.cwd(), '.flotsam');
            case 'linux':
                return join(homedir(), '.local', 'share', '.flotsam');
            default:
                throw new Error();
        }
    }
}
