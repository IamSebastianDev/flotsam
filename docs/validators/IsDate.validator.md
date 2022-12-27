<!-- @format -->

# `IsDate`

Validator function to validate a Value to be a valid Date.

## API

Type: `ValidatorFunction`

## Usage

```ts
import { Flotsam } from 'flotsam/db';
import { NotNull, IsDate } from 'flotsam/validators';

const collection = await db.collect<{ date: Date }>('collection', {
    validate: {
        date: [NotNull, IsDate],
    },
});
```
