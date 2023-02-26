<!-- @format -->

# `CollectionOf`

Validator to check a given value to be a valid array of **[Record Links](../db/RecordLinks.md)**

## API

Type: `(collection: string | Collection) => ValidatorFunction`

## Usage

```ts
import { Flotsam } from 'flotsam/db';
import { NotNull, CollectionOf, RecordLink } from 'flotsam/validators';
const collection = await db.collect<{ jobs: RecordLink<'jobs'>[] }>('collection', {
    validate: {
        jobs: [NotNull, CollectionOf('jobs')],
    },
});
```
