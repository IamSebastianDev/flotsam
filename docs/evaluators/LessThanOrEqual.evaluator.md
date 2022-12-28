<!-- @format -->

# `LessThanOrEqual`

**Evaluator Function** to compare a given condition for being less than or equal to a stored value.
The second parameter is an optional object that can set the function to be
strict. In strict mode, null or undefined will throw an error instead of evaluating to false, if null is not
the given search value.

## API

Type: `(condition: any, options?: { strict: boolean }) => EvaluatorFunction`

## Usage

```ts
import { Flotsam } from 'flotsam/db';
import { LessThanOrEqual } from 'flotsam/evaluators';

const collection = await db.collect<{ age: number }>('collection');

// Search for a Document containing a `age` property less than or equal to 3
const result = await collection.findOneBy({ age: LessThanOrEqual(3) });

// Perform the same search, but throw an error when encountering a null or undefined value
const result = await collection.findOneBy({ age: LessThanOrEqual(3, { strict: true }) });
```
