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
-   [GreaterThan & GreaterThanOrEqual](./GreaterThan.evaluator.md) to check for numeric values that are larger than a given value
-   [In](./In.evaluator.md) to check if a checked value is included in a given array
-   [Is](./Is.evaluator.md) to check for a loose match of a given value
-   [LessThan & LessThanOrEqual](./LessThan.evaluator.md) to check for numeric values that are smaller than a given value
-   [Like](./Like.evaluator.md) for advanced text comparisons
-   [NotEqual](./NotEqual.evaluator.md) to check for a value being not equal to a given value
-   [RegExp](./RegExp.evaluator.md) to evaluate a value by a given regular expression

## Using an Evaluator
