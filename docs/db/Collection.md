<!-- @format -->

# Collection

The **Collection** class is used to interface between a **Fløtsam** instance and it's **Documents**.
A **Collection** is created when executing the`collect()` method on a **Fløtsam** instance with a given namespace.
As a namespace is directly tied to it's physical counterpart, instancing a existing **Collection** via
the `collect()` method will return the cached **Collection**.

## API

### Collection (Class)

#### `new Collection<T>(ctx: Flotsam, namespace: string, validationStrategy: Validator<T>): Collection<T>`

The constructor of the **Collection** is used to assign the Database Context, the namespace passed to the Database's `collect()` method as well as the validator that is supposed to be used with the **Collection**. The instantiation of the **Collection** is usually handled by the passed **Fløtsam** instance and shouldn't be initiated manually.

#### `collection.count: Promise<number>`

Returns the number of **Documents** currently stored in the **Collection** as a `Promise`.

```ts
const count = await collection.count;
console.log(count);
// Logs number of Documents currently stored in the Collection
```

#### `collection.entries: Promise<Document<T>[]>`

Returns a copy of all **Documents** stored in the **Collection** as a `Promise`.

```ts
const entries = await collection.entries;
console.log(entries);
// Logs an Array that contains a copy of all Documents stored in the Collection
```

#### `collection.deserialize(): Promise<boolean>`

Method used to deserialize the **Collection**. This will load all records stored in the namespaced folder into the internal cache. The deserialization process will return true if successful. The serialization and deserialization of the **Collection** is usually handled by the passed **Fløtsam** instance and shouldn't be initiated manually.

#### `collection.serialize(): Promise<boolean>`

Method used to serialize the **Collection**. This will store all objects in the internal cache as record in the namespaced folder. The process will return true if successful. The serialization and deserialization of the **Collection** is usually handled by the passed **Fløtsam** instance and shouldn't be initiated manually.

#### `collection.jettison(): Promise<boolean>`

Drops the **Collection** and removes all physical **Documents** stored on disk. The process will return true if successful and is usually handled by the passed **Fløtsam** instance and shouldn't be initiated manually.

#### `collection.insertOne(data: T | Document): Promise<Document<T> | false>`

Method to insert data or a **Document** into the **Collection**. If a **Document** is given that already exists, the **Document** is upserted. The inserted **Document** is returned on success, if unsuccessful `false` is returned.

```ts
import { Flotsam } from 'flotsam';
...
const collection = await db.collect<{ name: string }>('collection');

// Insert the document
const result = await collection.insertOne({ name: 'Flotsam' });
```

#### `collection.insertMany(...data: T | Document<T>): Promise<Document<T>[] | false>`

Method to insert multiple sets of data or **Documents** into the **Collection**. If any **Document** is given that already exists, that **Document** is upserted. The inserted **Documents** are returned on success, if unsuccessful `false` is returned.

```ts
import { Flotsam } from 'flotsam';
...
const collection = await db.collect<{ name: string }>('collection');

// Insert multiple documents
const result = await collection.insertMany({ name: 'Flotsam' }, { name: 'Jetsam' });
```

#### `collection.deleteOne(findOptions: FindOptions<T>): Promise<Document<T> | false>`

Method to delete the first found **Document** by a given set of `FindOptions`. Returns the deleted **Document** or false, if no **Document** was found.

```ts
import { Flotsam } from 'flotsam';
import { Like } from 'flotsam/evaluator';

const collection = await db.collect<{ name: string }>('collection');

// Search for the first Document containing a `name` property including 'flotsam'
// and delete it.
const result = await collection.deleteOne({ where: { name: Like('flotsam') } });
```

#### `collection.deleteOneBy(findOptions: FindByProperty<T>): Promise<Document<T> | false>`

Method to delete the first found **Document** by a given set of `FindByProperty` options. Returns the deleted **Document** or false, if no **Document** was found.

```ts
import { Flotsam } from 'flotsam';
import { Like } from 'flotsam/evaluator';

const collection = await db.collect<{ name: string }>('collection');

// Search for the first Document containing a `name` property including 'flotsam'
// and delete it.
const result = await collection.deleteOneBy({ name: Like('flotsam') });
```

#### `collection.deleteOneById(id: string): Promise<Document | false>`

Method to delete the first found **Document** by a given id. Returns the deleted **Document** or false, if no **Document** was found.

```ts
import { Flotsam } from 'flotsam';

const collection = await db.collect<{ name: string }>('collection');

// Search for a Document by an Id and delete it.
const result = await collection.deleteOneById('<ObjectId>');
```

#### `collection.deleteMany(findOptions: FindOptions<T>): Promise<Document<T>[] | false>`

Method to delete any number of **Documents** according to the given `FindOptions`. Returns the deleted **Documents** or false, if no **Documents** were found.

```ts
import { Flotsam } from 'flotsam';
import { Like } from 'flotsam/evaluator';

const collection = await db.collect<{ name: string }>('collection');

// Search for any number of Documents containing a `name` property including 'flotsam'
// and delete them
const result = await collection.deleteMany({ where: { name: Like('flotsam') } });
```

#### `collection.findOne(findOptions: FindOptions<T>): Promise<Document<T> | null>`

Method to select a **Document** according to the given `FindOptions`. Returns the **Document** or `null` if no result was found.

```ts
import { Flotsam } from 'flotsam';
import { Like } from 'flotsam/evaluator';

const collection = await db.collect<{ name: string }>('collection');

// Search for the first Document containing a `name` property including 'flotsam'
const result = await collection.findOne({ where: { name: Like('flotsam') } });
```

#### `collection.findOneBy(findOptions: FindByProperty<T>): Promise<Document<T> | null>`

Method to select a **Document** according to the given `FindByProperty` options. Returns the **Document** or `null` if no **Document** was found.

```ts
import { Flotsam } from 'flotsam';
import { Like } from 'flotsam/evaluator';

const collection = await db.collect<{ name: string }>('collection');

// Search for the first Document containing a `name` property including 'flotsam'
const result = await collection.findOne({ name: Like('flotsam') });
```

#### `collection.findOneById(id: string): Promise<Document<T> | null>`

Method to select the first found **Document** by a given id. Returns the **Document** or null, if no **Document** was found.

```ts
import { Flotsam } from 'flotsam';

const collection = await db.collect<{ name: string }>('collection');

// Search for a Document by it's Id.
const result = await collection.findOneById('<ObjectId>');
```

#### `collection.findMany(findOptions: FindOptions<T>): Promise<Document<T>[]>`

Method to select any number of **Documents** according to the given `FindOptions`. Returns an Array containing the selected **Documents**.

```ts
import { Flotsam } from 'flotsam';
import { Like } from 'flotsam/evaluator';

const collection = await db.collect<{ name: string }>('collection');

// Search for any number of Documents containing a `name` property including 'flotsam'
const result = await collection.findMany({ where: { name: Like('flotsam') } });
```

#### `collection.findManyBy(findOptions: FindByProperty<T>): Promise<Document<T>[]>`

Method to select any number of **Documents** according to the given `FindByProperty` options. Returns an Array containing the selected **Documents**.

```ts
import { Flotsam } from 'flotsam';
import { Like } from 'flotsam/evaluator';

const collection = await db.collect<{ name: string }>('collection');

// Search for any number of Documents containing a `name` property including 'flotsam'
const result = await collection.findMany({ name: Like('flotsam') });
```

#### `collection.updateOne(findOptions: FindOptions<T>, data: Partial<T>): Promise<Document<T> | false>`

Method to select the first **Document** from the collection that satisfies a given set of `FindOptions` and update it with the given data. The Method returns the updated **Document** or false, if the operation was unsuccessful.

```ts
import { Flotsam } from 'flotsam';
import { Like } from 'flotsam/evaluator';

const collection = await db.collect<{ name: string }>('collection');

// Update the first document satisfying the given `FindOptions`
const result = await collection.updateOne({ where: { name: Like('flotsam') } }, { name: 'jetsam' });
```

#### `collection.updateOneBy(findOptions: FindByProperty<T>, data: Partial<T>): Promise<Document<T> | false>`

Method to select the first **Document** from the collection that satisfies a given set of `FindByProperty` options and update it with the given data. The Method returns the updated **Document** or false, if the operation was unsuccessful.

```ts
import { Flotsam } from 'flotsam';
import { Like } from 'flotsam/evaluator';

const collection = await db.collect<{ name: string }>('collection');

// Update the first document satisfying the given `FindByProperty` options
const result = await collection.updateOneBy({ name: Like('flotsam') }, { name: 'jetsam' });
```

#### `collection.updateOneById(id: string, data: Partial<T>): Promise<Document<T> | false>`

Method to select the first found **Document** by a given id and update it with the given data. The Method returns the updated **Document** or false, if the operation was unsuccessful.

```ts
import { Flotsam } from "flotsam";

const collection = await db.collect<{ name: string }>('collection')

// Update the document with the given Id
const result = await collection.updateOneById(<ObjectId>, { name: 'jetsam' });
```

#### `collection.updateMany(findOptions: FindOptions<T>, data: Partial<T>): Promise<Document<T>[] | false>`

Method to select any number of **Documents** according to the given `FindOptions` and update them with the given data. Returns an Array containing the updated **Documents** or false, if the operation was unsuccessful.

```ts
import { Flotsam } from 'flotsam';
import { Like } from 'flotsam/evaluator';

const collection = await db.collect<{ name: string }>('collection');

// Search for any number of Documents containing a `name` property including 'flotsam'
// and update them
const result = await collection.updateMany({ where: { name: Like('flotsam') } }, { name: 'jetsam' });
```

#### `collection.updateManyBy(findOptions: FindByProperty<T>, data: Partial<T>): Promise<Document<T>[] | false>`

Method to select any number of **Documents** according to the given `FindByProperty` options and update them with the given data. Returns an Array containing the updated **Documents** or false, if the operation was unsuccessful.

```ts
import { Flotsam } from 'flotsam';
import { Like } from 'flotsam/evaluator';

const collection = await db.collect<{ name: string }>('collection');

// Search for any number of Documents containing a `name` property including 'flotsam'
// and update them
const result = await collection.updateManyBy({ name: Like('flotsam') }, { name: 'jetsam' });
```

#### collection.observe(observedFindOptions: FindOptions<T>): Promise<Observable<Document<T>[]>>

Method to create a Observable that will emit to it's Subscribers when the provided `observedFindOptions` match a Document during insert or update operations. The Observable will emit all **Documents** matching the findOptions.

```ts
const collection = await db.collect<{ name: string }>('flotsam');
const queryObserver$ = await collection.observe({ where: { name: 'flotsam' } });

// register a Subscriber on the created Observable
queryObserver$.subscribe((documents) => {
    console.log(documents);
});

// insert a document to emit from the Observable
await collection.insertOne({ name: 'flotsam' });

// The emitting Observable will now log the Document to the console
// Document: { name: 'flotsam', _id: <ObjectId> }
```

## Usage

```ts
const collection = await db.collect('<namespace>');

// any collection will accept a generic as argument,
// enabling strict type checks in subsequent methods
const users = await db.collect<{ name: string }>('users');
```

The created **Collection** is used to insert, find, update and delete **Documents**, that are contained
within the **Collection**. There are different methods available for each operation.

### Inserting a **Document**

This will create the **Document** and place it inside the **Collection**'s cache as well
as the physical storage location. If encryption is enabled, the **Document** will be encrypted
before being physically placed. If a **Document** is passed to the method instead of a
data Object, the **Document** will be upserted if it already exists.

```ts
const doc = await users.insertOne({ name: 'Flotsam' });
// logs { name: 'Flotsam', _id: ObjectId }
```

### Finding a **Document**

A **Document** can be searched for and found by each of it's properties by creating a
corresponding `FindOptions` object. Methods exist to select a **Document** inside the
Collection by it's Id or it's properties without specifying pagination or ordering
parameters.

```ts
const doc = await users.findOneBy({ name: 'Flotsam' });
// logs { name: 'Flotsam', _id: ObjectId }
```

### Updating a **Document**

A **Document** can be updated by providing a `FindOptions` object to identify the **Document** to
update as well as a object containing the properties to update.

```ts
const doc = await users.updateOne({ where: { name: 'Flotsam' } }, { name: 'Jetsam' });
// logs { name: 'Jetsam', _id: ObjectId }
```

### Deleting a **Document**

Deleting a **Document** will remove it from the **Collection**s cache as well from it's physical
storage location.

```ts
let doc = await users.deleteOne({ where: { name: 'Flotsam' } });
// logs false
doc = await users.deleteOne({ where: { name: 'Jetsam' } });
// logs { name: 'Jetsam', _id: ObjectId }
```

A **Collection** should not be instanced directly. If a **Collection** instance is
created, a `Flotsam` instance needs to be passed as well as the namespace.
