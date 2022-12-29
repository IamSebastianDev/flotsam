/** @format */

import test from 'ava';
import { Flotsam } from '../src';
import {
    Exactly,
    Is,
    Like,
    In,
    Unsafe,
    RegExp,
    NotEqual,
    GreaterThan,
    GreaterThanOrEqual,
    LessThan,
    LessThanOrEqual,
    Contains,
} from '../src/lib/Evaluators';

// Setup the test by creating a new Database instance and populate it with
// a Collection and a Document

test.beforeEach(async (t) => {
    const db = new Flotsam({ root: './tests/.store', quiet: true });
    await db.connect();
    const test = await db.collect<{ data: string; number: number; obj: { key: string } }>('test');
    await test.insertOne({ data: 'test', number: 2, obj: { key: 'name' } });

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

test.serial('[Evaluators] Exactly should throw when accessing a non existing property in strict mode.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.throwsAsync(async () => {
        ///@ts-expect-error
        await test.findOne({ where: { data2: Exactly('test2', { strict: true }) } });
    });
});

test.serial('[Evaluators] Exactly should not throw when accessing a non existing property.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.notThrowsAsync(async () => {
        ///@ts-expect-error
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
        ///@ts-expect-error
        await test.findOne({ where: { data2: Is('test2', { strict: true }) } });
    });
});

test.serial(
    '[Evaluators] Is should not throw when accessing a non existing property not in strict mode.',
    async (t) => {
        const db = (t.context as Record<string, unknown>).db as Flotsam;
        const test = await db.collect<{ data: string; number: number }>('test');

        await t.notThrowsAsync(async () => {
            ///@ts-expect-error
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
        ///@ts-expect-error
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
        ///@ts-expect-error
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
        ///@ts-expect-error
        await test.findOne({ where: { data2: Unsafe(In('test2')) } });
    });
});

/**
 * RegExp
 */

test.serial('[Evaluators] RegExp should succeed when passed a correct regexp', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    let result = await test.findOne({ where: { data: RegExp(/[a-z]/) } });
    t.not(result, null);
    t.is(result?.data, 'test');
});

test.serial('[Evaluators] RegExp should fail when passed a non matching regexp', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    let result = await test.findOne({ where: { data: RegExp(/[A-Z]/) } });
    t.is(result, null);
});

test.serial('[Evaluators] RegExp should throw when validating a non string value', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.throwsAsync(async () => await test.findOne({ where: { number: RegExp(/[0-9]/) } }));
});

/**
 * NotEqual
 */

test.serial('[Evaluators] NotEqual should match two values that are not equal', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { data: NotEqual('test2') } });
    t.not(result, null);
    t.is(result?.data, 'test');
});

test.serial('[Evaluators] NotEqual should not match two values that are equal', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { data: NotEqual('test') } });
    t.is(result, null);
    t.not(result?.data, 'test');
});

test.serial('[Evaluators] NotEqual should throw when accessing a non existing property in strict mode.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.throwsAsync(async () => {
        ///@ts-expect-error
        await test.findOne({ where: { data2: NotEqual('test2', { strict: true }) } });
    });
});

test.serial('[Evaluators] NotEqual should not throw when accessing a non existing property.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.notThrowsAsync(async () => {
        ///@ts-expect-error
        await test.findOne({ where: { data2: Exactly('test2') } });
    });
});

/**
 * GreaterThan
 */

test.serial('[Evaluators] GreaterThan should find a value that is larger than the condition.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { number: GreaterThan(1) } });
    t.not(result, null);
    t.is(result?.number, 2);
});

test.serial('[Evaluators] GreaterThan should not find a value that is smaller than the condition.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { number: GreaterThan(3) } });
    t.is(result, null);
    t.not(result?.number, 1);
});

test.serial(
    '[Evaluators] GreaterThan should throw when accessing a non existing property in strict mode.',
    async (t) => {
        const db = (t.context as Record<string, unknown>).db as Flotsam;
        const test = await db.collect<{ data: string; number: number }>('test');

        await t.throwsAsync(async () => {
            ///@ts-expect-error
            await test.findOne({ where: { number2: GreaterThan(2, { strict: true }) } });
        });
    }
);

test.serial('[Evaluators] GreaterThan should not throw when accessing a non existing property.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.notThrowsAsync(async () => {
        ///@ts-expect-error
        await test.findOne({ where: { number2: GreaterThan(2) } });
    });
});

/**
 * GreaterThanOrEqual
 */

test.serial('[Evaluators] GreaterThanOrEqual should find a value that is larger than the condition.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { number: GreaterThanOrEqual(1) } });
    t.not(result, null);
    t.is(result?.number, 2);
});

test.serial('[Evaluators] GreaterThanOrEqual should find a value that is equal than the condition.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { number: GreaterThanOrEqual(2) } });
    t.not(result, null);
    t.is(result?.number, 2);
});

test.serial(
    '[Evaluators] GreaterThanOrEqual should not find a value that is smaller than the condition.',
    async (t) => {
        const db = (t.context as Record<string, unknown>).db as Flotsam;
        const test = await db.collect<{ data: string; number: number }>('test');

        const result = await test.findOne({ where: { number: GreaterThanOrEqual(3) } });
        t.is(result, null);
        t.not(result?.number, 1);
    }
);

test.serial(
    '[Evaluators] GreaterThanOrEqual should throw when accessing a non existing property in strict mode.',
    async (t) => {
        const db = (t.context as Record<string, unknown>).db as Flotsam;
        const test = await db.collect<{ data: string; number: number }>('test');

        await t.throwsAsync(async () => {
            ///@ts-expect-error
            await test.findOne({ where: { number2: GreaterThanOrEqual(2, { strict: true }) } });
        });
    }
);

test.serial('[Evaluators] GreaterThanOrEqual should not throw when accessing a non existing property.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.notThrowsAsync(async () => {
        ///@ts-expect-error
        await test.findOne({ where: { number2: GreaterThanOrEqual(2) } });
    });
});

/**
 * LessThan
 */

test.serial('[Evaluators] LessThan should find a value that is smaller than the condition.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { number: LessThan(3) } });
    t.not(result, null);
    t.is(result?.number, 2);
});

test.serial('[Evaluators] LessThan should not find a value that is larger than the condition.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { number: LessThan(1) } });
    t.is(result, null);
    t.not(result?.number, 2);
});

test.serial('[Evaluators] LessThan should throw when accessing a non existing property in strict mode.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.throwsAsync(async () => {
        ///@ts-expect-error
        await test.findOne({ where: { number2: LessThan(2, { strict: true }) } });
    });
});

test.serial('[Evaluators] LessThan should not throw when accessing a non existing property.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.notThrowsAsync(async () => {
        ///@ts-expect-error
        await test.findOne({ where: { number2: LessThan(2) } });
    });
});

/**
 * LessThanOrEqual
 */

test.serial('[Evaluators] LessThanOrEqual should find a value that is smaller than the condition.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { number: LessThanOrEqual(3) } });
    t.not(result, null);
    t.is(result?.number, 2);
});

test.serial('[Evaluators] LessThanOrEqual should find a value that is equal than the condition.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { number: LessThanOrEqual(2) } });
    t.not(result, null);
    t.is(result?.number, 2);
});

test.serial('[Evaluators] LessThanOrEqual should not find a value that is larger than the condition.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    const result = await test.findOne({ where: { number: LessThanOrEqual(1) } });
    t.is(result, null);
    t.not(result?.number, 2);
});

test.serial(
    '[Evaluators] LessThanOrEqual should throw when accessing a non existing property in strict mode.',
    async (t) => {
        const db = (t.context as Record<string, unknown>).db as Flotsam;
        const test = await db.collect<{ data: string; number: number }>('test');

        await t.throwsAsync(async () => {
            ///@ts-expect-error
            await test.findOne({ where: { number2: LessThanOrEqual(2, { strict: true }) } });
        });
    }
);

test.serial('[Evaluators] LessThanOrEqual should not throw when accessing a non existing property.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number }>('test');

    await t.notThrowsAsync(async () => {
        ///@ts-expect-error
        await test.findOne({ where: { number2: LessThanOrEqual(2) } });
    });
});

/**
 * Contains
 */

test.serial('[Evaluators] Contains should find a value that is nested in a Object.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number; obj: { key: string } }>('test');

    const result = await test.findOne({ where: { obj: Contains({ key: Like('name') }) } });
    t.not(result, null);
    t.is(result?.obj?.key, 'name');
});

test.serial('[Evaluators] Contains should throw when accessing a non existing property in strict mode.', async (t) => {
    const db = (t.context as Record<string, unknown>).db as Flotsam;
    const test = await db.collect<{ data: string; number: number; obj: { key: string } }>('test');

    await t.throwsAsync(async () => {
        ///@ts-expect-error
        await test.findOne({ where: { obj2: Contains({ key: Like('name') }, { strict: true }) } });
    });
});

test.serial(
    '[Evaluators] Contains should not throw when accessing a non existing property not in strict mode.',
    async (t) => {
        const db = (t.context as Record<string, unknown>).db as Flotsam;
        const test = await db.collect<{ data: string; number: number; obj: { key: string } }>('test');

        await t.notThrowsAsync(async () => {
            ///@ts-expect-error
            await test.findOne({ where: { obj2: Contains({ key: Like('name') }) } });
        });
    }
);
