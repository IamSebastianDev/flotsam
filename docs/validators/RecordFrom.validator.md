<!-- @format -->

# `RecordFrom`

Validator to check a given value to be a valid **[Record Link](../db/RecordLinks.md)**

## API

Type: `(collection: string | Collection) => ValidatorFunction`

## Usage

```ts
import { Flotsam } from 'flotsam/db';
import { NotNull, RecordFrom, RecordLink } from 'flotsam/validators';
const collection = await db.collect<{ job: RecordLink<'jobs'> }>('collection', {
    validate: {
        job: [NotNull, RecordFrom('jobs')],
    },
});
```
