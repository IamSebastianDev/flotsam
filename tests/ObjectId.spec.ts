/** @format */

import test from 'ava';
import { ObjectId } from '../src/lib/Db/ObjectId';

test('[ObjectId] Instances correctly', (t) => {
    t.is(typeof new ObjectId(), 'object');
});

test('[ObjectId] ObjectId.str returns a string', (t) => {
    const id = new ObjectId().str;
    t.is(typeof id, 'string');
});

test('[ObjectId] ObjectId.value() returns a string', (t) => {
    const id = new ObjectId().valueOf();
    t.is(typeof id, 'string');
});

test('[ObjectId] ObjectId.is identifies a correct value', (t) => {
    const value = '123456$idStringIdStringIdString';
    t.notThrows(() => ObjectId.is(value));
    t.true(ObjectId.is(value));
});

test('[ObjectId] ObjectId.is throws an error when a wrong value is passed', (t) => {
    t.throws(() => ObjectId.is('notAIdString'));
    t.throws(() => ObjectId.is('123456notAIdStringNotAIdString'));
    t.throws(() => ObjectId.is('1234A9$notAIdStringNotAIdString'));
    t.throws(() => ObjectId.is('1234A9$notAId-tringNot.IdString'));
});

test('[ObjectId] returns a unique id', (t) => {
    const id1 = new ObjectId();
    const id2 = new ObjectId();

    t.false(ObjectId.compare(id1, id2));
});

test('[ObjectId] compares two ids correctly', (t) => {
    const id1 = new ObjectId();
    const id2 = new ObjectId();

    t.true(ObjectId.compare(id1, id1));
    t.true(ObjectId.compare(id2, id2));
    t.false(ObjectId.compare(id1, id2));
});

test('[ObjectId] ObjectId.from() constructs a new ObjectId', (t) => {
    const raw = new ObjectId().str;
    t.notThrows(() => ObjectId.from(raw));
});
