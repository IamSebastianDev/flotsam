/** @format */

import test from 'ava';
import { Flotsam } from '../src';

test('[Flotsam] Instances correctly', (t) => {
    t.is(typeof new Flotsam({ root: './store' }), 'object');
});
