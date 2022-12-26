/** @format */

import { existsSync, readFileSync } from 'fs';
import test from 'ava';
import { Flotsam, IsString, Like, NotNull } from '../src';

test.serial('[Flotsam] Instances correctly', (t) => {
    t.is(typeof new Flotsam({ root: './store' }), 'object');
});

test.serial('[Flotsam] Creates a collection', async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true });

    await db.connect();
    await db.collect('flotsam');

    t.assert(existsSync('./tests/.store/flotsam'));
});

test.serial('[Flotsam] Drops a collection', async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true });

    await db.connect();
    await db.collect('flotsam');
    await db.jettison('flotsam');

    t.assert(!existsSync('./tests/.store/flotsam'));
});

test.serial('[Flotsam] Correctly serializes a collection', async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true });

    await db.connect();
    const collection = await db.collect<{ test: string }>('flotsam');
    const item = await collection.insertOne({ test: 'test' });

    if (!item) {
        return t.fail('Document incorrectly inserted.');
    }

    await db.close();

    const file = readFileSync(`./tests/.store/flotsam/${item.id}`, 'utf-8');
    t.is(JSON.parse(file)._.test, 'test');
});

test.serial('[Flotsam] Correctly deserializes a collection', async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true });

    await db.connect();
    const collection = await db.collect<{ test: string }>('flotsam');
    const [item] = await collection.findMany({ where: {} });

    if (!item) {
        return t.fail('Document incorrectly inserted.');
    }

    await db.jettison('flotsam');
    await db.close();

    t.is(item.test, 'test');
});

test.serial('[Flotsam] Correctly serializes a collection encrypted', async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true, auth: 'auth' });

    await db.connect();
    const collection = await db.collect<{ test: string }>('flotsam');
    const item = await collection.insertOne({ test: 'test' });

    if (!item) {
        return t.fail('Document incorrectly inserted.');
    }

    await db.close();

    const file = readFileSync(`./tests/.store/flotsam/${item.id}`, 'utf-8');
    t.assert('vector' in JSON.parse(file) && 'content' in JSON.parse(file));
});

test.serial('[Flotsam] Correctly deserializes an encrypted collection', async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true, auth: 'auth' });

    await db.connect();
    const collection = await db.collect<{ test: string }>('flotsam');
    const [item] = await collection.findMany({ where: {} });

    if (!item) {
        t.fail('Document incorrectly inserted.');
    }

    await db.jettison('flotsam');
    await db.close();

    t.is(item.test, 'test');
});

test.serial('[Flotsam] Inserts a record', async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true, auth: 'auth' });

    await db.connect();
    const collection = await db.collect<{ test: string }>('flotsam');
    const item = await collection.insertOne({ test: 'test' });

    await db.jettison('flotsam');
    await db.close();

    t.truthy(item);
});

test.serial('[Flotsam] Inserts a record and validates them', async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true, auth: 'auth' });

    await db.connect();
    const collection = await db.collect<{ test: string }>('flotsam', {
        validate: {
            test: [NotNull, IsString],
        },
    });
    const item = await collection.insertOne({ test: 'test' });

    await db.jettison('flotsam');
    await db.close();

    t.truthy(item);
});

test.serial('[Flotsam] Inserts multiple records', async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true, auth: 'auth' });

    await db.connect();
    const collection = await db.collect<{ test: string }>('flotsam');
    const items = await collection.insertMany({ test: 'test' }, { test: 'test2' });

    await db.jettison('flotsam');
    await db.close();

    t.truthy(items);
});

test.serial('[Flotsam] Finds a record using find options', async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true, auth: 'auth' });

    await db.connect();
    const collection = await db.collect<{ test: string }>('flotsam');
    await collection.insertOne({ test: 'test' });
    const item = await collection.findOne({
        where: {
            test: 'test',
        },
    });

    await db.jettison('flotsam');
    await db.close();

    t.truthy(item);
    t.is(item?.test, 'test');
});

test.serial('[Flotsam] Finds multiple records using find options', async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true, auth: 'auth' });

    await db.connect();
    const collection = await db.collect<{ test: string }>('flotsam');
    await collection.insertOne({ test: 'test' });
    await collection.insertOne({ test: 'test2' });

    const items = await collection.findMany({
        where: {
            test: Like('test'),
        },
    });

    await db.jettison('flotsam');
    await db.close();

    t.truthy(items);
    t.is(items.length, 2);
});

test.serial('[Flotsam] Finds multiple records using find options and sort them descending', async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true, auth: 'auth' });

    await db.connect();
    const collection = await db.collect<{ index: number }>('flotsam');
    await collection.insertOne({ index: 0 });
    await collection.insertOne({ index: 1 });

    const items = await collection.findMany({
        where: {},
        order: {
            property: 'index',
            by: 'DESC',
        },
    });

    await db.jettison('flotsam');
    await db.close();

    t.truthy(items);
    t.is(items.length, 2);
    t.is(items[0].index, 1);
    t.is(items[1].index, 0);
});

test.serial('[Flotsam] Finds multiple records using find options and sort them ascending', async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true, auth: 'auth' });

    await db.connect();
    const collection = await db.collect<{ index: number }>('flotsam');
    await collection.insertOne({ index: 0 });
    await collection.insertOne({ index: 1 });

    const items = await collection.findMany({
        where: {},
        order: {
            property: 'index',
            by: 'ASC',
        },
    });

    await db.jettison('flotsam');
    await db.close();

    t.truthy(items);
    t.is(items.length, 2);
    t.is(items[0].index, 0);
    t.is(items[1].index, 1);
});

test.serial('[Flotsam] Finds multiple records using findByProperty options', async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true, auth: 'auth' });

    await db.connect();
    const collection = await db.collect<{ test: string }>('flotsam');
    await collection.insertOne({ test: 'test' });
    await collection.insertOne({ test: 'test2' });

    const items = await collection.findManyBy({
        test: Like('test'),
    });

    await db.jettison('flotsam');
    await db.close();

    t.truthy(items);
    t.is(items.length, 2);
});

test.serial('[Flotsam] Finds a record using findByProperty options', async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true, auth: 'auth' });

    await db.connect();
    const collection = await db.collect<{ test: string }>('flotsam');
    await collection.insertOne({ test: 'test' });
    const item = await collection.findOneBy({
        test: 'test',
    });

    await db.jettison('flotsam');
    await db.close();

    t.truthy(item);
    t.is(item?.test, 'test');
});

test.serial('[Flotsam] Finds a record using findById', async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true, auth: 'auth' });

    await db.connect();
    const collection = await db.collect<{ test: string }>('flotsam');
    const inserted = await collection.insertOne({ test: 'test' });

    if (!inserted) {
        return t.fail('Document incorrectly inserted.');
    }

    const { id } = inserted;
    const item = await collection.findOneById(id);

    await db.jettison('flotsam');
    await db.close();

    t.truthy(item);
    t.is(item?.test, 'test');
});
