/** @format */

import test from 'ava';
import { Observable } from '../src/lib/Db/Observable';

test('[Observable] is created correctly', (t) => {
    const observable$ = new Observable();

    t.truthy('subscribe' in observable$);
    t.truthy('complete' in observable$);
    t.truthy('next' in observable$);
});

test('[Observable] can be subscribed on', (t) => {
    const observable$ = new Observable(0);
    const subscription = observable$.subscribe((value) => {});

    t.truthy('dispose' in subscription);
    t.truthy('once' in subscription);
});

test('[Observable] emits correctly', (t) => {
    const observable$ = new Observable(0);
    const subscription = observable$.subscribe((value) => {
        t.is(value, 0);
    });

    observable$.next(0);
    subscription.dispose();
});

test('[Observable] maps a value correctly after emitting', (t) => {
    const observable$ = new Observable(0);

    const mapped$ = observable$.map((value) => value * 2);
    const subscription = mapped$.subscribe((value) => {
        t.is(value, 2);
    });

    observable$.next(1);
    subscription.dispose();
});
