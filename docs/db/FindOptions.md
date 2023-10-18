<!-- @format -->

# Find Options

To query a **Collection**, `Find Options` are used to describe the query. `Find Options` consist of the properties to match to values, the ordering of the found **Documents** by `property` and `direction` as well as the ability to `skip`, `take` and `limit` **Documents** to enable pagination.

## API

The `Find Options` Object has the following schema:

```ts
export type FindOptions<T> = {
    where: FindByProperty<Partial<T>> | FindByProperty<Partial<T>>[];
    order?: {
        property: keyof T | '_id';
        by: 'ASC' | 'DESC';
    };
    skip?: number;
    take?: number;
    limit?: number;
};
```

### Properties

#### `where: FindByProperty<Partial<T> | FindByProperty<Partial<T>>[]`

`where` describes the properties to search for. All properties inside a `where` property must match the values in a **Document** for the **Document** to be considered matched. If multiple different conditions should be checked independently of each other, pass an array of `FindByProperty` options.

#### `order: { property: keyof T | '_id', by: 'ASC' | 'DESC' }`

`order` is an object used to describe the property to sort by as well as the sort order, ascending or descending. The results can be sorted by any property contained in the **Document**, even if it's not included in the search.

#### `skip: number`

`skip` describes the amount of found **Documents** to skip before returning results.

#### `take: number`

`take` describes the number of found **Documents** to return as result.

#### `limit: number`

`limit` describes the number of **Documents** to operate on.

## Order of Operations

The `Find Options` are evaluated in the following order:

-   **Documents** are selected by the given `Find Options`
-   The results are limited.
-   The results are ordered.
-   The results are skipped.
-   The results are taken and returned.

## Querying a Collection using `Find Options`

Consider the example below, where `Find Options` are used to query a **Collection**.

```ts
import { Flotsam } from 'flotsam/db';
const db = new Flotsam({ root: '.store' });
await db.connect();

const collection = await db.collect<{ value: string }>('collection');

// To return all Documents stored inside the Collection
// pass an Find Options object with an empty `where` property
const items = await collection.findMany({ where: {} });
```

> Note: Passing an empty `where` property to the Find Options is equal to matching all Documents

To match **Documents** inside a **Collection**, fixed values as well as **Evaluators** can be passed inside the `Find Options`.

```ts
import { Flotsam } from 'flotsam/db';
import { Like } from 'flotsam/evaluators';

const db = new Flotsam({ root: '.store' });
await db.connect();

const collection = await db.collect<{ value: string }>('collection');

// Using a fixed value compares the Values directly.
// This is equal to using the `Exactly` evaluator.
const items = await collection.findMany({
    where: {
        value: 'string',
    },
});

// Using the `Like` evaluator matches all Documents where
// value contains the string 'string' in any form.
const items = await collection.findMany({
    where: {
        value: Like('string'),
    },
});
```

## Ordering results

Results can be ordered and sorted by any property inside the **Document** in ascending (`ASC`) or descending (`DESC`) order.

```ts
import { Flotsam } from 'flotsam/db';
import { Like } from 'flotsam/evaluators';

const db = new Flotsam();

await db.connect('flotsam');

const collection = await db.collect<{ value: string }>('collection');

// Using the `order` property enables sorting the results before returning them.
const items = await collection.findMany({
    where: {},
    order: {
        by: 'ASC',
        property: 'value',
    },
});
```

## Paginating results

To enable pagination, results can be `skipped` and `taken`.

```ts
import { Flotsam } from 'flotsam/db';
import { Like } from 'flotsam/evaluators';

const db = new Flotsam();

await db.connect('flotsam');

const collection = await db.collect<{ value: string }>('collection');

// Using the skip & take properties, results can be selected precisely from the collection
const items = await collection.findMany({
    where: {},
    skip: 10 // skip the first 10 results found
    take: 10 // take the next 10 results found
});
```

## Limiting results

The query can have a limit passed, which will limit the number of results to operate on.

```ts
import { Flotsam } from 'flotsam/db';
import { Like } from 'flotsam/evaluators';

const db = new Flotsam();

await db.connect('flotsam');

const collection = await db.collect<{ value: string }>('collection');

// Using the limit, a subsection of the found results is used for operating on.
const items = await collection.findMany({
    where: {},
    limit: 10, // Limit the initial results to 10
    // ordering will now only happen on the 10 limited results.
    order: {
        by: 'ASC',
        property: 'value',
    },
});
```
