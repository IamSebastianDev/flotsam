<!-- @format -->

# `In`

**Evaluator Function** to check if a stored value is included in an Array of given values.
The second parameter is an optional object that can set the function to be strict. In strict mode, null or undefined will throw an error instead of evaluating to false, if null is not the given search value.

## API

Type: `(condition: any[], options?: { strict: boolean }) => EvaluatorFunction`

## Usage

```ts
import { Flotsam } from 'flotsam/db';
import { In } from 'flotsam/evaluators';
const collection = await db.collect<{ age: number }>('collection');

// Search for a Document containing a `age` property that is either 1, 2 or 3
const result = await collection.findOneBy({ age: In([1, 2, 3]) });

// Perform the same search, but throw an error when encountering a null or undefined value
const result = await collection.findOneBy({ age: In([1, 2, 3], { strict: true }) });
```
