<!-- @format -->

# Record Links

Analogous to relations in a relational database, **Record Links** can be used to create connections between different **Collections**. This can be used to organize your data schema.

## Record Link Tokens

The primary system between linking records is the `Record Link Token`, that consists of a namespace representing a **Collection** and a id representing the **Document** to be linked contained in that **Collection** separated by a semicolon.

```ts
// example for a Record Link Token consisting of namespace and id
const token = 'users:132512$GjCW48P2XTeaFNSlKaCNK3qA';
```

## Creating a Record Link Token during insert or Update of records

You can manually create the token or use the existing `Link()` function to create the token.

```ts
import { Link } from 'flotsam/db';

const namespace = 'users';
const id = new ObjectId(); // '132512$GjCW48P2XTeaFNSlKaCNK3qA'

const token = `${namespace}:${id}`;
const link = Link('users', id); // 'users:132512$GjCW48P2XTeaFNSlKaCNK3qA'
```

### `Link = <T, K extends Record<PropertyKey, unknown>>(collection: T | Collection<K>, recordId: string | ObjectId): RecordLink<T>`

The `Link()` function is used to create a `Record Link Token` programmatically. The first accepted argument is a `String` or a **Collection** that represents the namespace of the link. The second argument can be either a string or `ObjectId`. A `RecordLink` string is returned that is usable as Token.

## Example

During findOperations, all `Records` linked in a `Record` will be pulled from their respective **Collections** and inserted into the returned **Document** recursively.

```ts
import { Flotsam, Link } from 'flotsam/db';
import { Contains } from 'flotsam/evaluators';
import { NotNull, IsString, IsInt, RecordFrom, CollectionOf } from 'flotsam/validators';

const db = new Flotsam();

await db.connect('flotsam');

// Create the models used for the Collections.

type User = {
    name: string;
    job: RecordLink<'jobs'>;
};

type Job = {
    name: string;
    users?: RecordLink<'users'>[];
};

/*
 * Create the collections with the correct validation. The Link is created
 * in both directions, but can only be required on one side of the link.
 * Requiring the link to be `NotNull` on both sides would lead to a circular
 * dependency.
 *
 * For validating inserted values to be a correct Record Link Token or array
 * thereof, the `RecordFrom` and `CollectionOf` validator functions can be used
 */

const jobs = await db.collect<Job>('jobs', {
    validate: {
        name: [NotNull, IsString],
        users: [CollectionOf('users')],
    },
});
const users = await db.collect<User>('users', {
    validate: {
        name: [NotNull, IsString],
        job: [NotNull, RecordFrom('jobs')],
    },
});

const job = await jobs.insertOne({
    name: 'JobTitle',
});

// A User is created and receives a Link to the previously
// created job using the Link function.

await users.insertOne({
    name: 'Name',
    job: Link(jobs, job.id),
});

const result = await users.findOne({
    where: {
        job: Contains({
            name: 'JobTitle',
        }),
    },
});

// Logs the created User
console.log({ result });

await db.jettison('users');
await db.jettison('jobs');
await db.close();
```
