<!-- @format -->

# Fløtsam

[![Npm package version](https://badgen.net/npm/v/flotsamjs)](https://www.npmjs.com/package/flotsamjs)[![Npm package total downloads](https://badgen.net/npm/dt/flotsamjs)](https://npmjs.com/package/flotsamjs)[![Npm package license](https://badgen.net/npm/license/flotsamjs)](https://npmjs.com/package/flotsamjs)[![Github tag](https://badgen.net/github/tag/iamsebastiandev/flotsam)](https://github.com/iamsebastiandev/flotsam/tags)

A [Typescript](https://www.typescriptlang.org) first, **JSON Document** based, dependency free minimal Database.

## Overview

Fløtsam is intended to be used for projects that do not require a database that can handle millions of lines, rows, columns or documents, like personal projects, quick prototyping or internal tools. It features an expressive way to query for **Documents** inside the Database, with the ability to _take_, _skip_, _limit_ and _order_ the query results. **Documents** are stored locally on disk and can be encrypted to ensure no unauthorized access. To increase I/O performance, all **Documents** are stored in memory.

## Installing

Install **Fløtsam** via npm or yarn:

```bash
npm install flotsamjs
#or
yarn add flotsamjs
```

This will install **Fløtsam** as a dependency into your project and create the necessary entry in your `package.json` file.

## Getting started

Setting up a initial instance of `Fløtsam` is quick and requires no configuration beyond a initial root directory, where the physical **JSON** files will be stored. For a more in depth guide on how to use **Fløtsam**, take a look at the full [documentation](./docs/readme.md)

Start by importing the Database into your Javascript or Typescript file. You are free to use `module` or `import` syntax, **Fløtsam** provides export for both standards. To make tree-shaking easier for bundlers, **Fløtsam** also provides submodule exports.

```ts
// Import the Flotsam class from the /db submodule of the library
import { Flotsam } from 'flotsam/db';

// or
import { Flotsam } from 'flotsam';
// or
const { Flotsam } = require('flotsam/db');
// or
const { Flotsam } = require('flotsam');
```

Depending on your `Node`, `Typescript` or preferred `JavaScript` version, you might want to use a specific way to import / require the library files.

### Creating a Fløtsam Instance

After importing the class, an instance is created that will represent the Database during the whole time of it's operation. There is no need to create multiple instances, and might even decrease performance or lead to sync issues.

> Note: The examples below assume you're using a Node version that supports top level async / await.

```ts
import { Flotsam } from 'flotsam/db';

// create the Fløtsam instance
const db = new Flotsam();

// connect to a Database instance. If the storage directory
// does not yet exist, it will be created in this step.
await db.connect('flotsam');
```

### Collections

A **Collection** is a subdivision of the Database instance, that holds a certain type of **Documents**. If you are using Typescript, the **Collection** can be strongly typed to ensure type safety on all operations. The **Collection** will hold all **Documents** that are related to it's namespace in it's cache. **Collections** also operate in isolation.

```ts
import { Flotsam } from 'flotsam/db';

const db = new Flotsam();
await db.connect('flotsam');

// create the collection under a 'jetsam' namespace
// this will create the physical directory, if it does not yet exist
const collection = await db.collect<{ description: string }>('jetsam');
```

### Performing basic CRUD Operations

**Fløtsam** uses an expressive `FindOptions` mechanism to identify **Documents** while performing operations. These `FindOptions` are standard JavaScript descriptions of the properties contained in a **Document** to operate on.

```ts
import { Flotsam } from 'flotsam/db';

const db = new Flotsam();
await db.connect('flotsam');

// creating a custom schema to ensure type safety
// during operations
type Jetsam = {
    description: string;
    weight: number;
};

const jetsam = await db.collect<Jetsam>('jetsam');

// Insert a Document into the Collection
const inserted = await jetsam.insertOne({ description: '...', weight: 3.14 });

// Update the Document based of the inserted Document's Id
const updated = await jetsam.updateOneById(inserted.id, { weight: 2.71 });

// Find a Document by a certain property
const found = await jetsam.findOneBy({ weight: 2.71 });

// Delete a Document by it's Id
const deleted = await jetsam.deleteOneById(found.id);

// after finishing the CRUD operations, disconnect from the Database
await db.close();
```

### Evaluators

While using **Find Options** is powerful, **Evaluators** make these Find Options even more powerful by providing functions that help evaluate the values of a record for something matching your search criteria.

> Read more about [**Evaluator Functions**](./docs/evaluators/evaluators.md)

```ts
import { Flotsam } from 'flotsam/db';
import { Like, GreaterThan } from 'flotsam/evaluators';

const db = new Flotsam();
await db.connect('flotsam');

type Jetsam = {
    description: string;
    weight: number;
};

const jetsam = await db.collect<Jetsam>('jetsam');

const item = await jetsam.findOne({
    where: {
        // The `Like` evaluator will match any string that
        // contains the supplied argument
        description: Like('floating'),
        // The `GreaterThan` evaluator will match any number
        // that is greater than the supplied argument
        weight: GreaterThan(10),
    },
});

await db.close();
```

### Schema validation

A **Collection** can receive a second optional argument to work as a **Schema Validator**. This will allow a more granular validation instead of strongly typing the collection, and will also ensure runtime validation of inserts and updates.

> Read more about [**Schema Validation**](./docs/validators/schema-validation.md)

```ts
import { Flotsam } from 'flotsam/db';
import { NotNull, IsText, IsInt } from 'flotsam/validators';

const db = new Flotsam();
await db.connect('flotsam');

type Jetsam = {
    description: string;
    weight: number;
};

// Add Schema Validation to the collection for more granular
// validation and runtime checks when inserting or updating.

const jetsam = await db.collect<Jetsam>('jetsam', {
    validate: {
        description: [NotNull, IsText({ min: 200 })],
        weight: [NotNull, IsInt({ min: 10 })],
    },
});

await db.close();
```

## Contributing

If you would like to contribute, take a look at the [Contribution Guide](./contributing.md). Contributors of any skill level are
appreciated, if you have any questions, feel free to reach out.

## License

Fløtsam is licensed under the [MIT License](https://opensource.org/licenses/MIT)
