<!-- @format -->

# Validators

**Validators** are functions used to describe rules that need to be matched when inserting or updating the properties of a **Document**. **Validators** can be combined to check a property for multiple different conditions.

## Available Validators

-   [NotNull](./NotNull.validator.md) to validate a value to be not null
-   [IsString](./IsString.validator.md) to validate a value to be a string
-   [IsNumber](./IsNumber.validator.md) to validate a value to be a number
-   [IsType](./IsType.validator.md) to validate a value to be a certain (complex) type
-   [IsText](./IsText.validator.md) to validate texts
-   [IsInt](./IsInt.validator.md) to validate a value to be an integer
-   [IsArray](./IsArray.validator.md) to validate a value to be an array

## Using a Validator

**Validators** are added in a Validation Scheme to a **Collection** when the **Collection** is created.

```ts

```

## Creating and using a custom Validator Function

Validators in their most basic form are `functions` that accept a value as argument and then check the value to comply to a condition. If the value is correctly validated, `true` is returned, if not, a `FlotsamValidationError` should be thrown.

```ts
// IsAuthor.validator.ts

import { FlotsamValidationError } from 'flotsam/validators';
import type { ValidatorFunction } from '';

// We create a custom validator function that accepts an
// array of authors and returns a function to validate
// those authors.

export const IsAuthor = (authors: string[]): ValidatorFunction => {
    return (value: unknown, propertyName: string) => {
        if (authors.includes(value)) {
            return true;
        }

        throw new FlotsamValidationError(`Property ${propertyName} is expected be included in datatype 'Authors'.`);
    };
};
```

The created **Validator Function** can be used like any other Evaluator.

```ts
import { Flotsam, FlotsamValidationError } from 'flotsam/db';
import { NotNull, IsString, IsType } from 'flotsam/validators';
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
