<!-- @format -->

# Schema Validation

Fløtsam enables you to provide a **Schema** for your collections to validate against when inserting or deserializing from the physical storage location. This is useful, to ensure that your **Documents** correspond to a certain **Schema**.

**Validation** is added directly to the Collection while creating it. Subsequent `collect()` calls will not override the validation provided initially.

```ts
+ import { Flotsam } from "flotsam/db";
+ import { NotNull, IsType, IsInt } from "flotsam/validators";

+ const db = new Flotsam({ root: '.store' });
+ await db.connect();

+ type User = {
+     name: string;
+     age: number;
+ }

+ // Validate the name and age fields for being of the correct type
+ // and not null.
+ const users = await db.collect<User>('users', {
+     validate: {
+         name: [NotNull, IsType('string')],
+         age: [NotNull, IsInt({ min: 0 })]
+    }
+ })
```

**Validators** are executed in the order in which they were defined and will throw a `FlotsamValidationError` when a incorrect value is inserted.
