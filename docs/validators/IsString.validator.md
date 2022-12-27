<!-- @format -->

# `IsString`

Evaluator Function to validate a Value to be of type string.

## API

Type: `ValidatorFunction`

## Usage

```ts
import { Flotsam } from 'flotsam/db';
import { NotNull, IsString } from 'flotsam/validators';

const collection = await db.collect<{ name: string }>('collection', {
    validate: {
        age: [NotNull, IsString],
    },
});
```
