<!-- @format -->

# Evaluators

**Evaluators** are functions used to evaluate property values inside a **Document** for matching a condition. They can be used to increase the granularity of a search query. There are a several predefined **Evaluators** as well as the option to create custom **Evaluator Functions**

## API

Type: `<T extends unknown, K extends Record<string, unknown>>(value: T, propertyName?: string, document?: K) => boolean`

The Evaluator Function is used to check a predefined condition against the value of the currently checked property.
The Function receives the value as the first Argument, the propertyName that is being evaluated as the second argument, and the complete document as the third argument.

## Available Evaluators

-   [Contains](./Contains.evaluator.md) to evaluate properties of a given object
-   [Exactly](./Exactly.evaluator.md) to check for an exact match of a given value
-   [GreaterThan](./GreaterThan.evaluator.md) & [GreaterThanOrEqual](./GreaterThanOrEqual.evaluator.md) to check for numeric values that are larger than a given value
-   [In](./In.evaluator.md) to check if a checked value is included in a given array
-   [Is](./Is.evaluator.md) to check for a loose match of a given value
-   [LessThan](./LessThan.evaluator.md) & [LessThanOrEqual](./LessThanOrEqual.evaluator.md) to check for numeric values that are smaller than a given value
-   [Like](./Like.evaluator.md) for advanced text comparisons
-   [NotEqual](./NotEqual.evaluator.md) to check for a value being not equal to a given value
-   [RegExp](./RegExp.evaluator.md) to evaluate a value by a given regular expression

## Using an Evaluator

**Evaluators** are used when searching a collection using [Find Options](../db/FindOptions.md).

```ts
import { Flotsam } from 'flotsam/db';
import { Like, GreaterThan } from 'flotsam/evaluators';

const db = new Flotsam({ root: '.store' });
await db.connect();

const collection = await db.collect<{ description: string; weight: number }>('flotsam');

// When searching a collection using find options, evaluators can be used to
// substitute a fixed value.

const item = collection.findOne({
    where: {
        // Like will match all descriptions containing 'floating in the ocean'. Case will be ignored.
        description: Like('floating in the ocean'),
        // GreaterThan will match all weights larger than 20.
        weight: GreaterThan(20),
    },
});
```

## Creating and using a custom Evaluator Function

Evaluators in their most basic form are `functions` that accept a value as argument and then checks the value against a condition. The function returns a Boolean indicating if the value matches or not. By default, null or undefined values simply return false, if you'd like to indicate that the value needs to be not null or undefined, a `FlotsamEvaluationError` should be thrown.

```ts
// IsBetween.evaluator.ts
import { FlotsamEvaluationError } from 'flotsam/evaluators';
import type { EvaluatorFunction, EvaluatorOptions } from 'flotsam/evaluators';

export const IsBetween = (min: number, max: number, options: EvaluatorOptions): EvaluatorFunction => {
    // strict is a boolean indicating if null or undefined should throw an error
    const { strict } = options;

    return (value: unknown, propertyName?: string) => {
        // Validate the value for being not null or undefined, before further checks occur.
        // If strict is falsy, we raise an error

        if (value === null || value === undefined) {
            if (!strict) return false;
            throw new FlotsamEvaluationError(`Property ${propertyName} is null or undefined.`);
        }

        // After validating the value to be neither null nor undefined,
        // we can perform the actual matching

        return value > min && value < max;
    };
};
```

The created **Evaluator** can be used like any other **Evaluator** when using **Find Options**

```ts
import { Flotsam } from 'flotsam/db';
import { Like, GreaterThan } from 'flotsam/evaluators';
import { IsBetween } from './IsBetween.evaluator';

const db = new Flotsam({ root: '.store' });
await db.connect();

const collection = await db.collect<{ description: string; weight: number }>('flotsam');

// When searching a collection using find options, evaluators can be used to
// substitute a fixed value.

const item = collection.findOne({
    where: {
        // Like will match all descriptions containing 'floating in the ocean'. Case will be ignored.
        description: Like('floating in the ocean'),
        // GreaterThan will match all weights between 20 and 40.
        weight: IsBetween(20, 40),
    },
});
```
