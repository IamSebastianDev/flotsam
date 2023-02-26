<!-- @format -->

# Validators

**Validators** are functions used to describe rules that need to be matched when inserting or updating the properties of a **Document**. **Validators** can be combined to check a property for multiple different conditions.

## API

**`Validator Function`**
Type: `<T extends unknown, K extends Record<string, unknown>>(value: T, propertyName?: string, document?: K) => boolean`

The Validator Function is used to validate a inserted value against a set of conditions. The function receives the `value` to check as the first argument. The name of the property being evaluated as well as the Document being evaluated are passed as optional Parameters. The function should return true if evaluating correctly and throw a `FlotsamValidationError` when evaluating incorrectly.

## Available Validators

-   [NotNull](./NotNull.validator.md) to validate a value to be not null
-   [IsString](./IsString.validator.md) to validate a value to be a string
-   [IsNumber](./IsNumber.validator.md) to validate a value to be a number
-   [IsType](./IsType.validator.md) to validate a value to be a certain (complex) type
-   [IsText](./IsText.validator.md) to validate texts
-   [IsInt](./IsInt.validator.md) to validate a value to be an integer
-   [IsArray](./IsArray.validator.md) to validate a value to be an array
-   [IsDate](./IsDate.validator.md) to validate a value to be a Date
-   [ValidateNested](./ValidateNested.validator.md) to validate the properties of a given object
-   [RecordFrom](./RecordFrom.validator.md) to validate a value to be a valid Record Link Token
-   [CollectionOf](./CollectionOf.validator.md) to validate a value be an array of valid Record Link Tokens

## Using a Validator

**Validators** are added in a [Validation Scheme](./schema-validation.md) to a **Collection** when the **Collection** is created. **Fløtsam** comes with two different kind of Validators, static and configurable.

-   Static Validators are Validator Functions, that validate a value to match a specific condition.
-   Configurable Validators are Functions, that create a Validator Function from a given set of options.

```ts
import { Flotsam } from 'flotsam/db';
import { NotNull, IsString, IsText } from 'flotsam/validators';

const db = new Flotsam({ root: '.store' });
await db.connect();

type Book = {
    title: string;
    description: string;
};

// Validate the collection to ensure that values
// inserted or update are correct
const books = await db.collect<Book>('books', {
    validate: {
        title: [NotNull, IsString], // NotNull and IsString are both static Validators
        description: [NotNull, IsText({ min: 80 })], // IsText is a configurable Validator
    },
});
```

## Creating and using a custom Validator Function

Validators in their most basic form are `functions` that accept a value as argument and then check the value to comply to a condition. If the value is correctly validated, `true` is returned, if not, a `FlotsamValidationError` should be thrown.

```ts
// IsAuthor.validator.ts

import { FlotsamValidationError } from 'flotsam/validators';
import type { ValidatorFunction } from 'flotsam/validators';

// We create a custom validator function that accepts an
// array of authors and returns a function to validate
// those authors.

export const IsAuthor = (authors: string[]): ValidatorFunction => {
    return (value: unknown, propertyName: string) => {
        if (authors.includes(value)) {
            return true;
        }

        throw new FlotsamValidationError(`Property ${propertyName} is expected be included in type 'Authors'.`);
    };
};
```

The created **Validator Function** can be used like any other Validator.

```ts
// main.ts
import { Flotsam } from 'flotsam/db';
import { NotNull, IsString, IsDate } from 'flotsam/validators';
import { IsAuthor } from './IsAuthor.validator';

const db = new Flotsam({ root: '.store' });
await db.connect();

const authors = ['George R. R. Martin', 'J. R. R. Tolkien', 'Rebecca Gablé'];

// Create a Type Schema to enable strong typing inside
// the collections methods

type Book = {
    author: string;
    title: string;
    releaseDate: Date;
    description: string;
};

// Below is an example for a more complex validation setup
// on a collection including our custom validator function

const books = await db.collect<Book>('books', {
    validate: {
        author: [NotNull, IsAuthor(authors)],
        title: [NotNull, IsString],
        releaseDate: [NotNull, IsDate],
        description: [NotNull, IsText({ min: 80 })],
    },
});
```
