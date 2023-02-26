<!-- @format -->

# `Includes`

**Evaluator Function** to check a array for containing items matching a given **EvaluatorFunction**.

## API

Type: `<T>(evaluator: EvaluatorFunction, options?: { strict: boolean }) => EvaluatorFunction`

## Usage

```ts
import { Flotsam } from 'flotsam/db';
import { Includes, Exactly } from 'flotsam/evaluators';

const collection = await db.collect<{ arr: string[] }>('collection');

// Search for a Document containing a arr property that contains an element
// that matches a 'flotsam' string
const result = await collection.findOneBy({ arr: Includes(Exactly('flotsam')) });

// Perform the same search, but throw an error when encountering a null or undefined value
const result = await collection.findOneBy({ arr: Includes(Exactly('flotsam'), { strict: true }) });
```
