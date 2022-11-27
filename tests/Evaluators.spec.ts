/** @format */

import test from 'ava';
import { Flotsam, Exactly, Is, Like, In, Unsafe } from '../src';

// Setup the test by creating a new Database instance and populate it with
// a Collection and a Document

test.beforeEach(async (t) => {
    const db = new Flotsam({ root: './tests/.store' });
    await db.connect();
    const test = await db.collect<{ data: string; number: number }>('test');
    await test.insertOne({ data: 'test', number: 2 });

    ((t.context as Record<string, unknown>).db as Flotsam) = db;
});

// drop the collection after each test

test.afterEach(async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    await db.jettison('test');
    await db.close();
});

test('[Evaluators] Exactly should match two identical values exactly', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { data: Exactly('test') } });
    t.not(result, null);
    t.is(result?.data, 'test');
});

test('[Evaluators] Exactly should not match two not identical values exactly', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { data: Exactly('test2') } });
    t.is(result, null);
    t.not(result?.data, 'test2');
});

test('[Evaluators] Exactly should throws wenn accessing a non existing property.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.throwsAsync(async () => {
        ///@ts-ignore
        await test.findOne({ where: { data2: Exactly('test2') } });
    });
});

test('[Evaluators] Is should match two identical values loosely', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { data: Is('test') } });
    t.not(result, null);
    t.is(result?.data, 'test');
});

test('[Evaluators] Is should not match two not identical values loosely', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { data: Is('test2') } });
    t.is(result, null);
    t.not(result?.data, 'test2');
});

test('[Evaluators] Is should throw wenn accessing a non existing property.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.throwsAsync(async () => {
        ///@ts-ignore
        await test.findOne({ where: { data2: Is('test2') } });
    });
});

test('[Evaluators] Is should match a property loosely.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { number: Is('2') } });
    t.not(result, null);
    t.is(result?.number, 2);
});

test('[Evaluators] Like should compare and match two values that intersect', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { data: Like('tes') } });
    t.not(result, null);
    t.is(result?.data, 'test');
});

test('[Evaluators] Like should compare and not match two values that do not intersect', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { data: Like('abc') } });
    t.is(result, null);
    t.not(result?.data, 'abc');
});

test('[Evaluators] Like should throw wenn passed a non existing property.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.throwsAsync(async () => {
        ///@ts-ignore
        await test.findOne({ where: { data2: Like('test2') } });
    });
});

test('[Evaluators] Like should throw wenn passed a non string property.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.throwsAsync(async () => {
        ///@ts-ignore
        await test.findOne({ where: { data2: Like(0) } });
    });
});

test('[Evaluators] In should succeed when passed a range including the stored value', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    let result = await test.findOne({ where: { number: In(0, 1, 2, 3) } });
    t.not(result, null);

    result = await test.findOne({ where: { number: In([0, 1, 2, 3]) } });
    t.not(result, null);
});

test('[Evaluators] In should fail when passed a range outside the stored value', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    let result = await test.findOne({ where: { number: In([0, 1, 3]) } });
    t.is(result, null);

    result = await test.findOne({ where: { number: In(0, 1, 3) } });
    t.is(result, null);
});

test('[Evaluators] In should throw wenn accessing a non existing property.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.throwsAsync(async () => {
        ///@ts-ignore
        await test.findOne({ where: { data2: In('test2') } });
    });
});

test('[Evaluators] Unsafe should not throw wenn accessing a non existing property.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.notThrowsAsync(async () => {
        ///@ts-ignore
        await test.findOne({ where: { data2: Unsafe(In('test2')) } });
    });
});
