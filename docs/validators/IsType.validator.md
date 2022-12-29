<!-- @format -->

# `IsArray`

Validator to check a given value to be inserted or updated for being an Array. The Validator is being constructed
by passing an object containing a `type` property. The property can either contain a `string` describing the expected
type or a function to evaluate the property to be a certain type.

## API

Type: `(validationRules?: { type: string | ValidatorFunction }) => ValidatorFunction`

## Usage

```ts
import { Flotsam } from 'flotsam/db';
import { NotNull, IsType } from 'flotsam/validators';

const authors = ['J.R.R Tolkien', 'Rebecca Gable', 'Douglas Adams'];

const collection = await db.collect<{ title: string; author: string[] }>('collection', {
    validate: {
        title: [NotNull, IsType({ type: 'string' })],
        author: [NotNull, IsType({ type: (value) => authors.includes(value) })],
    },
});
```
