/** @format */

import test from 'ava';
import {
    IsText,
    IsInt,
    NotNull,
    IsArray,
    IsType,
    IsNumber,
    IsString,
    IsDate,
    ValidateNested,
} from '../src/lib/Validators';

// IsText

test('[Validators] IsText correctly validates a string', (t) => {
    const value = 'Test text';
    const validator = IsText();

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsText correctly validates a nullish value', (t) => {
    const value = undefined;
    const validator = IsText();

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsText correctly validates a non string', (t) => {
    const value = 5;
    const validator = IsText();

    t.throws(() => validator(value, 'test-property'));
});

test('[Validators] IsText correctly validates a short string', (t) => {
    const value = 'Test';
    const validator = IsText({ min: 5 });

    t.throws(() => validator(value, 'test-property'));
});

test('[Validators] IsText correctly validates a long string', (t) => {
    const value = 'Test Test Test';
    const validator = IsText({ max: 5 });

    t.throws(() => validator(value, 'test-property'));
});

// IsInt

test('[Validators] IsInt correctly validates a Integer', (t) => {
    const value = 5;
    const validator = IsInt();

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsInt correctly validates a nullish value', (t) => {
    const value = undefined;
    const validator = IsInt();

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsInt correctly validates a non Integer', (t) => {
    const value = 'test';
    const validator = IsInt();

    t.throws(() => validator(value, 'test-property'));
});

test('[Validators] IsInt correctly validates a short Integer', (t) => {
    const value = 1;
    const validator = IsInt({ min: 5 });

    t.throws(() => validator(value, 'test-property'));
});

test('[Validators] IsInt correctly validates a long Integer', (t) => {
    const value = 10;
    const validator = IsInt({ max: 5 });

    t.throws(() => validator(value, 'test-property'));
});

// NotNull

test('[Validators] NotNull correctly validates a non null value', (t) => {
    const value = 10;
    const validator = NotNull;

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] NotNull correctly validate a null value', (t) => {
    const value = null;
    const validator = NotNull;

    t.throws(() => validator(value, 'test-property'));
});

// IsArray

test('[Validators] IsArray correctly validates an Array', (t) => {
    const value = new Array();
    const validator = IsArray();

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsArray correctly validates an nullish value', (t) => {
    const value = undefined;
    const validator = IsArray();

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsArray correctly validates a non Array value', (t) => {
    const value = 'test';
    const validator = IsArray();

    t.throws(() => validator(value, 'test-property'));
});

test('[Validators] IsArray correctly validates an Array of a minimum length', (t) => {
    const value = new Array(10);
    const validator = IsArray({ min: 15 });

    t.throws(() => validator(value, 'test-property'));
});

test('[Validators] IsArray correctly validates an Array of a maximum length', (t) => {
    const value = new Array(10);
    const validator = IsArray({ max: 5 });

    t.throws(() => validator(value, 'test-property'));
});

test('[Validators] IsArray correctly validates an Array of a item with a certain type', (t) => {
    const value = new Array(10).fill('test');
    const validator = IsArray({ items: 'string' });

    t.notThrows(() => validator(value, 'test-property'));
});

test('[Validators] IsArray correctly validates an Array of a item with a certain type, that does not fulfil the type condition.', (t) => {
    const value = new Array(10).fill(0);
    const validator = IsArray({ items: 'string' });

    t.throws(() => validator(value, 'test-property'));
});

test('[Validators] IsArray correctly validates an Array using Validator Functions', (t) => {
    const value = [
        [1, 2],
        [1, 2],
    ];
    const validator = IsArray({ items: [IsArray({ items: [IsInt()] })] });

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsArray correctly validates an Array of a item with a certain type, that does not fulfil the type condition using Evaluator Functions', (t) => {
    const value = new Array(10).fill(0);
    const validator = IsArray({ items: [IsString] });

    t.throws(() => validator(value, 'test-property'));
});

// IsType

test('[Validators] IsType correctly validates a String', (t) => {
    const value = 'string';
    const validator = IsType({ type: 'string' });

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsType correctly validates a nullish value', (t) => {
    const value = undefined;
    const validator = IsType({ type: 'string' });

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsType correctly validates a Number', (t) => {
    const value = 10;
    const validator = IsType({ type: 'number' });

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsType correctly validates a Boolean', (t) => {
    const value = true;
    const validator = IsType({ type: 'boolean' });

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsType correctly validates a Object', (t) => {
    const value = {};
    const validator = IsType({ type: 'object' });

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsType correctly throws when receiving a incorrect type', (t) => {
    const value = 0;
    const validator = IsType({ type: 'boolean' });

    t.throws(() => validator(value, 'test-property'));
});

test('[Validators] IsType correctly validates a complex type', (t) => {
    const values = ['a', 'b', 'c'];
    const value = 'b';

    const validator = IsType({ type: (value: unknown) => values.includes(<string>value) });

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsType correctly validates a complex incorrect type', (t) => {
    const values = ['a', 'b', 'c'];
    const value = 2;

    const validator = IsType({ type: (value: unknown) => values.includes(<string>value) });

    t.throws(() => validator(value, 'test-property'));
});

// IsString

test('[Validators] IsString correctly validates a String', (t) => {
    const value = 'string';
    const validator = IsString;

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsString correctly validates a nullish value', (t) => {
    const value = undefined;
    const validator = IsString;

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsString correctly validates a non String', (t) => {
    const value = 0;
    const validator = IsString;

    t.throws(() => validator(value, 'test-property'));
});

// IsNumber

test('[Validators] IsNumber correctly validates a Number', (t) => {
    const value = 31415;
    const validator = IsNumber;

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsNumber correctly validates a nullish value', (t) => {
    const value = undefined;
    const validator = IsNumber;

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsString correctly validates a non Number', (t) => {
    const value = 'test';
    const validator = IsNumber;

    t.throws(() => validator(value, 'test-property'));
});

// IsDate

test('[Validators] IsDate correctly validates a Date Object', (t) => {
    const value = new Date();
    const validator = IsDate;

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsDate correctly validates a nullish value', (t) => {
    const value = undefined;
    const validator = IsDate;

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsDate correctly validates a Date String', (t) => {
    const value = '2022-12-10T18:55:09.374Z';
    const validator = IsDate;

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] IsDate correctly validates a value that does not represent a Date', (t) => {
    const value = 'test';
    const validator = IsDate;

    t.throws(() => validator(value, 'test-property'));
});

// ValidateNested

test('[Validators] ValidateNested correctly validates a nested property', (t) => {
    const value = { key: 'test' };
    const validator = ValidateNested<typeof value>({ key: [IsText()] });

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] ValidateNested correctly validates a nullish property', (t) => {
    const value = undefined;
    ///@ts-expect-error
    const validator = ValidateNested<typeof value>({ key: [IsText()] });

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] ValidateNested correctly validates a deeply nested property', (t) => {
    const value = { key: { test: 'test' } };
    const validator = ValidateNested<typeof value>({ key: [ValidateNested({ test: [IsString] })] });

    t.is(validator(value, 'test-property'), true);
});

test('[Validators] ValidateNested correctly validates a value that is not an object', (t) => {
    const value = 'test';
    const validator = ValidateNested({ key: 'test' });

    t.throws(() => validator(value, 'test-property'));
});

test('[Validators] ValidateNested correctly validates a value that is an empty object', (t) => {
    const value = {};
    const validator = ValidateNested({ key: 'test' });

    t.throws(() => validator(value, 'test-property'));
});
