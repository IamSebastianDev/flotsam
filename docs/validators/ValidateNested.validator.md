<!-- @format -->

# `ValidateNested`

Validator to validate the properties of a given object.

## API

Type: `<T extends Record<string, unknown>(validationStrategy: {
    [Prop in keyof T]: ValidatorFunction<T[Prop], T> | ValidatorFunction<T[Prop], T>[];
}) => ValidatorFunction`

## Usage

```ts
import { Flotsam } from "flotsam/db";
import { NotNull, ValidateNested, IsString } from "flotsam/validators";

const collection = await db.collect<{ object: { key: string } } }>('collection', {
    validate: {
        object: [NotNull, ValidateNested({
            key: [NotNull, IsString]
        })]
    }
})
```
