/** @format */

import test from 'ava';
import { Flotsam, Exactly, Is } from '../src';

// Setup the test by creating a new Database instance and populate it with
// a Collection and a Document

test.beforeEach(async (t) => {
    const db = new Flotsam({ root: './tests/.store' });
    await db.connect();
    const test = await db.collect<{ data: string; number: number }>('test');
    await test.insertOne({ data: 'test', number: 2 });

    ((t.context as Record<string, unknown>).db as Flotsam) = db;
});

test.afterEach(async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    await db.jettison('test');
    await db.close();
});

test('[Evaluators] Exactly matches two identical values exactly', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { data: Exactly('test') } });
    t.not(result, null);
    t.is(result?.data, 'test');
});

test('[Evaluators] Exactly does not match two not identical values exactly', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { data: Exactly('test2') } });
    t.is(result, null);
    t.not(result?.data, 'test2');
});

test('[Evaluators] Exactly throws wenn accessing a non existing property.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.throwsAsync(async () => {
        ///@ts-ignore
        await test.findOne({ where: { data2: Exactly('test2') } });
    });
});

test('[Evaluators] Is matches two identical values loosely', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { data: Is('test') } });
    t.not(result, null);
    t.is(result?.data, 'test');
});

test('[Evaluators] Is does not match two not identical values loosely', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { data: Is('test2') } });
    t.is(result, null);
    t.not(result?.data, 'test2');
});

test('[Evaluators] Is throws wenn accessing a non existing property.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.throwsAsync(async () => {
        ///@ts-ignore
        await test.findOne({ where: { data2: Is('test2') } });
    });
});

test('[Evaluators] Is matches a property loosely.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { number: Is('2') } });
    t.not(result, null);
    t.is(result?.number, 2);
});
