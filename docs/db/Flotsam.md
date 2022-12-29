<!-- @format -->

# Flotsam

The `Flotsam` class is the main interface for using the database. All operations concerning the creation or removing of collections happens using a created `Flotsam` instance.

## Configuration

A configuration object can be used to configure the **Fløtsam** instance.

```ts
import { Flotsam } from 'flotsam/db';

const db = new Flotsam({
    root: '.store', // Directory to store the created JSON Documents.
    log: '.log', // File to store error and query logs.
    quiet: false, // Boolean indicating if logs should be suppressed.
    auth: 'secretKey', // Encryption key for encrypting the stored Document.
});
```

### `Root`

Type: `string`

String describing the root of the directory used to store the JSON documents.

### `log`

Type: `string | undefined`

If a string is passed as property, the string will be used as location for a log file, where all errors are logged to.
The logfile will be created relative to the storage root of the db.

### `quiet`

Type: `boolean | undefined`

Boolean indicating if logs & warnings should be suppressed.

### `auth`

Type: `string | undefined

A string used as secret to encrypt the JSON Documents on disk. If no string is passed,
no encryption will take place.`

## API

### `new Flotsam(init: FlotsamInit): Flotsam`

The constructor is used used to create and configure a new **Flotsam** instance.

### `flotsam.close(): Promise<void>`

Closes the connection of the **Flotsam** instance and serializes all Documents to disk.

```ts
await db.close();
```

### `flotsam.connect(callback: Callback | null, error?: ErrorHandler): Promise<boolean>`

Connects the **Flotsam** instance. The underlying storage space is validated or created in this step. A success and error Callback can be passed to method, which will be called when the connection succeeds or fails.

```ts
import { Flotsam } from 'flotsam/db';

const db = new Flotsam({ root: '.store' });
await db.connect();

// passing a callback and error handler
await db.connect(
    // Will be called when the connection is established successfully
    () => console.log('connected'),
    // Will be called when the connection failed
    (error) => console.log(error)
);
```

### `flotsam.collect<T>(namespace: string, validationStrategy: Validator<T>): Promise<Collection<T>>`

Method to retrieve a **Collection** from the database. The **Collection** is deserialized from the filesystem and cached. Subsequent calls to the collect method will return the cached reference to the **Collection**. A second argument can be provided to create a **Validation Schema** to validate inserted or updated **Documents**.

```ts
import { Flotsam } from 'flotsam/db';
import { NotNull, IsString } from 'flotsam/validators';

const db = new Flotsam({ root: '.store' });

// Create a schema to pass to the collection
type Book = { title: string };

// Pass the object containing the validator to the collect method
const books = await db.collect<Book>('books', {
    validate: {
        title: [NotNull, IsString],
    },
});
```

### `flotsam.emit(event: FlotsamEvent, ...args: any[]): void`

Method to emit a `FlotsamEvent` with a specific Payload. This is the method used by the **Flotsam** instance to emit it's own events.

### `flotsam.jettison(namespace: string, soft?: boolean = false): Promise<boolean>`

Method to remove a **Collection** from the physical storage directory or the collection cache, when the `soft` argument is set to true.

```ts
import { Flotsam } from 'flotsam/db';

const db = new Flotsam({ root: '.store' });
const collection = await db.collect('collection');

// drop the created collection
await db.jettison('collection');
```

### `flotsam.on(event: FlotsamEvent, handler: Subscriber): Unsubscriber`

Method to listen to a `Flotsam Event` emitted by the database. The handler passed as second argument will be called whenever the corresponding event is emitted. The method returns a function to unsubscribe and remove the handler from the instance.

```ts
import { Flotsam } from 'flotsam/db';

const db = new Flotsam({ root: '.store' });
// register a handler that is called when the db is connected.
db.on('connect', () => console.log('connected'));

await db.connect();
// logs 'connected' to the console.
```

## Usage

```ts
import { Flotsam } from 'flotsam/db';

const db = new Flotsam({
    // the physical location for the stored documents
    root: '.store',
});

// connect to the database to ensure that the necessary setup
// operations are performed.
await db.connect();

// creating a typed collection
const collection = await db.collect<{ name: string }>('collection');

// close the collection properly to ensure correct deserialization
await db.close();
```
