/** @format */

import test from 'ava';
import { Flotsam } from '../src';

test('[Flotsam] Instances correctly', (t) => {
    const db = new Flotsam({ root: './store' });
    t.is(typeof db, 'object');
    t.assert(db instanceof Flotsam);
});
