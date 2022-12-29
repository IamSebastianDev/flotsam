<!-- @format -->

# `NotNull`

Evaluator Function to validate a Value to be not Null or Undefined.

## API

Type: `ValidatorFunction`

## Usage

```ts
import { Flotsam } from 'flotsam/db';
import { NotNull, IsString } from 'flotsam/validators';

const collection = await db.collect<{ name: string }>('collection', {
    validate: {
        name: [NotNull, IsType({ type: 'string' })],
    },
});
```
