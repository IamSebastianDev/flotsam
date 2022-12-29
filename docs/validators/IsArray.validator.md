<!-- @format -->

# `IsArray`

Validator to check a given value to be inserted or updated for being an Array. The value can receive
an optional object to configure the Validator to check for a minimum and/or maximum length as well as
check the Array items for being of a certain type. The type can be set using a string or a
Validator Function or Array of Validator Functions.

## API

Type: `(validationRules?: { min: number; max: number; items: string | ValidatorFunction | ValidatorFunction[]
}) => ValidatorFunction`

## Usage

```ts
import { Flotsam } from 'flotsam/db';
import { NotNull, IsArray, IsString } from 'flotsam/validators';

const collection = await db.collect<{ books: string[] }>('collection', {
    validate: {
        books: [NotNull, IsArray({ min: 0, items: [NotNull, IsString] })],
    },
});
```
