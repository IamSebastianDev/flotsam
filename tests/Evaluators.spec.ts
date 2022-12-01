/** @format */

import test from 'ava';
import { Flotsam } from '../src';
import { Exactly, Is, Like, In, Unsafe } from '../src/lib/Evaluators';

// Setup the test by creating a new Database instance and populate it with
// a Collection and a Document

test.beforeEach(async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true });
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

/**
 * Exactly
 */

test.serial('[Evaluators] Exactly should match two identical values exactly', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { data: Exactly('test') } });
    t.not(result, null);
    t.is(result?.data, 'test');
});

test.serial('[Evaluators] Exactly should not match two not identical values exactly', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { data: Exactly('test2') } });
    t.is(result, null);
    t.not(result?.data, 'test2');
});

test.serial('[Evaluators] Exactly should throws when accessing a non existing property in strict mode.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.throwsAsync(async () => {
        ///@ts-ignore
        await test.findOne({ where: { data2: Exactly('test2', { strict: true }) } });
    });
});

test.serial('[Evaluators] Exactly should not throw when accessing a non existing property.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.notThrowsAsync(async () => {
        ///@ts-ignore
        await test.findOne({ where: { data2: Exactly('test2') } });
    });
});

test.serial('[Evaluators] Exactly should compare null values.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string | null; number?: number }>('test');
    await test.insertOne({ data: null });

    await t.notThrowsAsync(async () => {
        let result = await test.findOne({ where: { data: Exactly(null) } });
        t.is(result?.data, null);
    });
});

/**
 * Is
 */

test.serial('[Evaluators] Is should match two identical values loosely', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { number: Is('2') } });
    t.not(result, null);
    t.is(result?.data, 'test');
});

test.serial('[Evaluators] Is should not match two not identical values loosely', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { number: Is('test2') } });
    t.is(result, null);
    t.not(result?.data, 'test2');
});

test.serial('[Evaluators] Is should throw when accessing a non existing property in strict mode.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.throwsAsync(async () => {
        ///@ts-ignore
        await test.findOne({ where: { data2: Is('test2', { strict: true }) } });
    });
});

test.serial(
    '[Evaluators] Is should not throw when accessing a non existing property not in strict mode.',
    async (t) => {
        const db = (t.context as Record<string, unknown>).db as Flotsam;
        const test = await db.collect<{ data: string; number: number }>('test');

        await t.notThrowsAsync(async () => {
            ///@ts-ignore
            await test.findOne({ where: { data2: Is('test2') } });
        });
    }
);

/**
 * Like
 */

test.serial('[Evaluators] Like should compare and match two values that intersect', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { data: Like('tes') } });
    t.not(result, null);
    t.is(result?.data, 'test');
});

test.serial('[Evaluators] Like should compare and not match two values that do not intersect', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { data: Like('abc') } });
    t.is(result, null);
    t.not(result?.data, 'abc');
});

test.serial('[Evaluators] Like should throw when passed a non existing property in strict mode.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.throwsAsync(async () => {
        ///@ts-ignore
        await test.findOne({ where: { data2: Like('test2', { strict: true }) } });
    });
});

test.serial('[Evaluators] Like should not throw when passed a non existing property not in strict mode.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.notThrowsAsync(async () => {
        ///@ts-ignore
        await test.findOne({ where: { data2: Like('test2') } });
    });
});

test.serial('[Evaluators] Like should throw when passed a non string property.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.throwsAsync(async () => {
        ///@ts-ignore
        await test.findOne({ where: { data: Like(0) } });
    });
});

/**
 * In
 */

test.serial('[Evaluators] In should succeed when passed a range including the stored value', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    let result = await test.findOne({ where: { number: In([0, 1, 2, 3]) } });
    t.not(result, null);
});

test.serial('[Evaluators] In should fail when passed a range outside the stored value', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    let result = await test.findOne({ where: { number: In([0, 1, 3]) } });
    t.is(result, null);
});

test.serial('[Evaluators] In should throw when accessing a non existing property in strict mode.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.throwsAsync(async () => {
        ///@ts-ignore
        await test.findOne({ where: { data2: In('test2', { strict: true }) } });
    });
});

test.serial(
    '[Evaluators] In should not throw when accessing a non existing property not in strict mode.',
    async (t) => {
        const db = (t.context as Record<string, unknown>).db as Flotsam;
        const test = await db.collect<{ data: string; number: number }>('test');

        await t.notThrowsAsync(async () => {
            ///@ts-ignore
            await test.findOne({ where: { data2: In('test2') } });
        });
    }
);

/**
 * Unsafe
 */

test.serial('[Evaluators] Unsafe should not throw when accessing a non existing property.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.notThrowsAsync(async () => {
        ///@ts-ignore
        await test.findOne({ where: { data2: Unsafe(In('test2')) } });
    });
});

/**
 * RegExp
 */

/**
 * NotEqual
 */

/**
 * GreaterThan
 */

/**
 * GreaterThanOrEqual
 */

/**
 * LessThan
 */

/**
 * LessThanOrEqual
 */
