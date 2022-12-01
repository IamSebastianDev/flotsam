<!-- @format -->

# Fløtsam

> Minimal Documentation for first Implementation

### Local testing

```bash
# clone repo
git clone https://github.com/IamSebastianDev/flotsam.git
# switch to development branch
git checkout development
# install dependencies and build the package
yarn ci
yarn build
# link the package locally
yarn link .

# Use the package in another project as local dependency by linking
yarn link flotsam
```

### Api

```ts
import { Flotsam } from 'flotsam/db';
import { Like, In, Exactly } from 'flotsam/evaluators';

// create and connect to the database instance
const db = new Flotsam({
    root: './store', // Physical directory to store the documents in
    auth: '<secret key>', // A secret key to ensure encryption on disk
    log: './store/.log', // Location for physical log file, leave empty to suppress log
});
await db.connect();

// create a collection
const collection = await db.collect<{ label: string; data: number }>('collection_name');

// insert a document into the collection

let doc = await collection.insertOne({ label: 'Item 1', data: 1 });

// update a document inside the collection

doc = await collection.updateOne({ where: { label: 'Item 1', data: 2 } });

// find a document inside the collection

doc = await collection.findOne({ where: { label: Like('item 1') } });
doc = await collection.findOne({ where: { data: In([1, 2, 3]) } });

// delete a document inside the collection

await collection.deleteOne({ where: { label: Exactly('Item 1') } });

// drop a collection

await db.jettison('collection_name');

// close the instance of the database

await db.close();
```
