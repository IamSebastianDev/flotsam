<!-- @format -->

# `Contains`

**Evaluator Function** to compare nested properties against a new set of **findByPropertyOptions**.

## API

Type: `<T>(findOptions: FindByProperty<T>, options?: { strict: boolean }) => EvaluatorFunction`

## Usage

```ts
import { Flotsam } from 'flotsam/db';
import { Contains, Exactly } from 'flotsam/evaluators';

const collection = await db.collect<{ obj: { key: string } }>('collection');

// Search for a Document containing a 'key' property inside the 'obj' property
// that matches a 'flotsam' string
const result = await collection.findOneBy({ obj: Contains({ key: Exactly('flotsam') }) });

// Perform the same search, but throw an error when encountering a null or undefined value
const result = await collection.findOneBy({ obj: Contains({ key: Exactly('flotsam') }, { strict: true }) });
```
