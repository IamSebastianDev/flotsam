<!-- @format -->

# `NotEqual`

**Evaluator Function** to compare to given values for being not equal. `NotEqual` will compare type and value to be
strictly unequal using the `!==` operator. The second parameter is an optional object that can set the function to be
strict. In strict mode, null or undefined will throw an error instead of evaluating to false, if null is not
the given search value.

## API

Type: `(condition: any, options?: { strict: boolean }) => EvaluatorFunction`

## Usage

```ts
import { Flotsam } from 'flotsam/db';
import { NotEqual } from 'flotsam/evaluators';

const collection = await db.collect<{ name: string }>('collection');

// Search for a Document containing a `name` property that does not match 'flotsam'
const result = await collection.findOneBy({ name: NotEqual('flotsam') });

// Perform the same search, but throw an error when encountering a null or undefined value
const result = await collection.findOneBy({ name: NotEqual('flotsam', { strict: true }) });
```
