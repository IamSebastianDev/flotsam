<!-- @format -->

# `IsText`

Validator to check a given value to be inserted or updated for being a text. The value can receive
an optional object to configure the Validator to check for a minimum and/or maximum length.

## API

Type: `(validationRules?: { min: number; max: number; }) => ValidatorFunction`

## Usage

```ts
import { Flotsam } from 'flotsam/db';
import { NotNull, IsText } from 'flotsam/validators';

const collection = await db.collect<{ description: string }>('collection', {
    validate: {
        age: [NotNull, IsText({ min: 200 })],
    },
});
```
