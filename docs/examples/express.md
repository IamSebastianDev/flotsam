<!-- @format -->

# Fløtsam - express example

This example shows how to use Fløtsam together with `ts-node` & `express` to create a basic Express CRUD app.

## Setup

-   Create a `package.json` file and set it's type to `module`

```json
{
    "name": "flotsam-express-test",
    "version": "1.0.0",
    "type": "module"
}
```

Install the necessary dependencies.

```bash
# install dependencies
npm install ts-node flotsamjs typescript express @types/express
```

Create a `tsconfig.json` file with the following options.

```json
{
    "compilerOptions": {
        "target": "ESNext",
        "module": "NodeNext",
        "esModuleInterop": true
    }
}
```

Create a `main.ts` file in the root of the project. You can now run the file with `ts-node-esm main.ts`. If this doesn't work, you might need to install **typescript** or **ts-node** globally.

## Creating a basic Express app

The goal ist to create a basic Express App that will expose an API to perform CRUD operations.

```ts
+ import express from 'express';
+ const app = express();

+ // add the json body parser middleware
+ app.use(express.json());

+ // start the app on Port 3000 to be able to call the API
+ app.listen(3000, () => console.log('App up on Port 3000'));
```

After creating the basic express application, create a **Fløtsam** instance and connect to it.

```ts
import express from 'express';
+ import { Flotsam } from "flotsam/db";
const app = express();

+ // create the database
+ const db = new Flotsam({
+     root: '.store'
+ })
+ await db.connect()

// add the json body parser middleware
app.use(express.json());

// start the app on Port 3000 to be able to call the API
app.listen(3000, () => console.log('App up on Port 3000'));
```

## Setting up the `users` Collection & API endpoints

```ts
/**
 * ... imports and setup code
 */

// add the json body parser middleware
app.use(express.json());

+ const users = await db.collect<{ name: string }>('users');

+ // Endpoint to get a user by it's id
+ app.get('/api/user/:id', (req, res) => {
+   await users.findOneById(req.params.id).then(
+       (result) => res.json({ result })
+   )
+ })

+ // Endpoint to create a user
+ app.post('/api/user/', (req, res) => {
+   const { name } = req.body;
+   await users.insertOne({ name }).then(
+       (result) => res.json({ result })
+   )
+ })

// start the app on Port 3000 to be able to call the API
app.listen(3000, () => console.log('App up on Port 3000'));
```

You can now use a tool like [postman](https://www.postman.com/downloads/) to test out the API. You can also use [Curl](https://curl.se) or any other tool to make a network request.

```bash
# use cURL to make a POST request to create a User
curl -X POST -H "Content-Type: application/json" \
    -d '{"name": "Flotsam"  }'  localhost:3000/api/user
# {"result": {"_id": {}, "name": "Flotsam", id: <ObjectId string>} }

# use cURL to make a GET request to retrieve the created User
curl -X GET localhost:3000/api/user/<ObjectId string>
# { "result": { "_id": {}, "name": "Flotsam", id: <ObjectId string> } }
```

## The complete example

```ts
import express from 'express';
import { Flotsam } from 'flotsam/db';
const app = express();

// create the database
const db = new Flotsam({
    root: '.store',
});
await db.connect();

// add the json body parser middleware
app.use(express.json());

const users = await db.collect<{ name: string }>('users');

// Endpoint to get a user by it's id
app.get('/api/user/:id', (req, res) => {
    await users.findOneById(req.params.id).then((result) => res.json({ result }));
});

// Endpoint to create a user
app.post('/api/user/', (req, res) => {
    const { name } = req.body;
    await users.insertOne({ name }).then((result) => res.json({ result }));
});

// start the app on Port 3000 to be able to call the API
app.listen(3000, () => console.log('App up on Port 3000'));
```
