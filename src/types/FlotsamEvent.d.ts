/** @format */

/**
 * Union type representing the different events that are dispatched by Flotsam during operation.
 */

export type FlotsamEvent =
    | 'close' // emitted when the connection to the database is closed.
    | 'connect' // emitted when the connection to the database is first created.
    | 'insert' // emitted when a document is inserted into the database.
    | 'upsert' //
    | 'delete' // emitted when a document is deleted from the database.
    | 'update' // emitted when a document is updated.
    | 'serialize' // emitted when a collection is serialized.
    | 'deserialize' // emitted when a collection is deserialized.
    | 'drop' // emitted when a collection is dropped.
    | 'error'; // emitted when a error occurs.
