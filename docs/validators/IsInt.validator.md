<!-- @format -->

# `IsInt`

Validator to check a given value to be inserted or updated for being an Integer. The value can receive
an optional object to configure the Validator to check for a minimum and/or maximum value.

## API

Type: `(validationRules?: { min: number; max: number; }) => ValidatorFunction`

## Usage

```ts
import { Flotsam } from 'flotsam/db';
import { NotNull, IsInt } from 'flotsam/validators';
const collection = await db.collect<{ age: number }>('collection', {
    validate: {
        age: [NotNull, IsInt({ min: 6, max: 99 })],
    },
});
```
