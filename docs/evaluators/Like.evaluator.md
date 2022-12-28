<!-- @format -->

# `Like`

**Evaluator Function** to compare a given string for being included in a stored string. `Like` will ignore case.
The second parameter is an optional object that can set the function to be
strict. In strict mode, null or undefined will throw an error instead of evaluating to false, if null is not
the given search value.

## API

Type: `(condition: string, options?: { strict: boolean }) => EvaluatorFunction`

## Usage

```ts
import { Flotsam } from 'flotsam/db';
import { Like } from 'flotsam/evaluators';

const collection = await db.collect<{ name: string }>('collection');

// Search for a Document containing a `name` property including 'flotsam'
const result = await collection.findOneBy({ name: Like('flotsam') });

// Perform the same search, but throw an error when encountering a null or undefined value
const result = await collection.findOneBy({ name: Like('flotsam', { strict: true }) });
```
