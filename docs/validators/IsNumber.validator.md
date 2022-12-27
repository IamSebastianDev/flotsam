<!-- @format -->

# `IsNumber`

Evaluator Function to validate a Value to be of type number.

## API

Type: `ValidatorFunction`

## Usage

```ts
import { Flotsam } from 'flotsam/db';
import { NotNull, IsNumber } from 'flotsam/validators';

const collection = await db.collect<{ age: number }>('collection', {
    validate: {
        age: [NotNull, IsNumber],
    },
});
```
