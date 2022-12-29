<!-- @format -->

# `RegExp`

**Evaluator Function** to test a given `RegExp` for being included in a stored string.
The second parameter is an optional object that can set the function to be
strict. In strict mode, null or undefined will throw an error instead of evaluating to false, if null is not
the given search value.

## API

Type: `(condition: RegExp, options?: { strict: boolean }) => EvaluatorFunction`

## Usage

```ts
import { Flotsam } from 'flotsam/db';
import { RegExp } from 'flotsam/evaluators';

const collection = await db.collect<{ name: string }>('collection');

// Search for a Document containing a `name` property that has only lower case characters
const result = await collection.findOneBy({ name: RegExp(/[a-z]/g) });

// Perform the same search, but throw an error when encountering a null or undefined value
const result = await collection.findOneBy({ name: RegExp(/[a-z]/g, { strict: true }) });
```
