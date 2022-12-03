<!-- @format -->

# Fløtsam - ts-node example

This example shows how to use Fløtsam together with `ts-node` to perform basic crud operations.

## Setup

-   Create a `package.json` file and set it's type to `module`

```json
{
    "name": "flotsam-ts-node-test",
    "version": "1.0.0",
    "type": "module"
}
```

Install the necessary dependencies.

```bash
# install dependencies
npm install ts-node flotsamjs typescript
```

Create a `tsconfig.json` file with the following options.

```json
{
    "compilerOptions": {
        "target": "ESNext",
        "module": "NodeNext",
        "esModuleInterop": true
    }
}
```

Create a `main.ts` file in the root of the project. You can now execute the file with `ts-node-esm main.ts`. If this doesn't work, you might need to install **typescript** or **ts-node** globally.

## Fløtsam

Open the `main.ts` file you just created and add the following lines to import and create a `Flotsam` Instance.

```ts
import { Flotsam } from 'flotsamjs/db';

const db = new Flotsam({
    root: '.store',
});
await db.connect();
```

Create a `Collection`.

```ts
import { Flotsam } from 'flotsamjs/db';

const db = new Flotsam({
    root: '.store',
});
await db.connect();

// create a Collection.
// this will also create a equally named directory in the
// previously declared root directory that will contain all
// Documents added to the Collection

const collection = await db.collect('my-first-collection');
```

With the `Collection` created, `Documents` can now be created, updated, searched and deleted.

```ts
/**
 * ... previous code omitted
 */

// define a schema for the collection
type Schema = {
    value: string;
};

const collection = await db.collect<Schema>('my-first-collection');

// Add a Document to the Collection
const inserted = await collection.insertOne({
    value: 'test',
});

// inserted will now log the new returned Document object
// { value: 'test', _id: {}, id: <ObjectId string> }
```

Similar methods exist on the `Collection` object for other operations:

-   `insertOne()`
-   `insertMany()`
-   `findOneById()`
-   `findOneBy()`
-   `findOne()`
-   `findManyBy()`
-   `findMany()`
-   `updateOneById()`
-   `updateOneBy()`
-   `updateOne()`
-   `updateMany()`
-   `deleteOneById()`
-   `deleteOne()`
-   `deleteMany()`

## Using FindOptions and Evaluators

**Fløtsam** brings it's own powerful ways to search and identify `Documents`, `FindOptions` & `Evaluators`. `FindOptions` are used to describe the `Document` or `Documents` you want to select, and `Evaluators` are used to describe conditions for matching values inside a Query.

```ts
type User = { name: string; age: number | null };
const users = await db.collect<User>('users');

// insert some Documents
await users.insertOne({ name: 'Flotsam', age: 10 });
await users.insertOne({ name: 'Jetsam', age: 5 });
await users.insertOne({ name: 'Derelict', age: 423 });
```

With the `Documents` inserted, a search can be performed for any of the properties defined in the Schema. This excludes the `_id` & `id` property. If you want to select a `Document` by it's Id, use the `<...>ById()` methods.

```ts
// import a Like as Evaluator, used to perform text comparisons.
import { Like } from 'flotsam/evaluators';

// search for any Document that contains the letters `sam`
const result = users.findMany({
    where: {
        name: Like('sam'),
    },
});

// result now logs all documents matching the Like evaluator
// [{ name: 'Flotsam', ... }, { name: 'Jetsam', ... }]
```

## Dropping a Collection

In case you want to remove a collection completely, you can `jettison` it.

```ts
await db.jettison('users');
// this will also remove all physical Documents
```
