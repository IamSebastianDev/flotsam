<!-- @format -->

# Fløtsam

In depth documentation for `1.1.0`

## API Documentation

The main database instance class is created using the **[Flotsam](./db/Flotsam.md)** class. All operations concerning **[Collections](./db/Collection.md)** as well as the general setup of the database is done here.

**[Collections](./db/Collection.md)** can be queried using [`Find Options`](./db/FindOptions.md) and [`Evaluators`](./evaluators/evaluators.md). [Schema Validation](./validators/schema-validation.md) is done via [`Validator Functions`](./validators/validators.md).

## Examples

The `examples` directory contains examples on how to use **Fløtsam**

-   [ts-node](./examples/ts-node.md)
-   [express](./examples/express.md)
