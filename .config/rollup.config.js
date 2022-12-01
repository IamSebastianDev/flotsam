/** @format */

import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import cleanup from 'rollup-plugin-cleanup';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import pkg from '../package.json' assert { type: 'json' };

const bundle = (config) => ({
    external: (id) => !/^[./]/.test(id),
    ...config,
});

export default [
    bundle({
        input: './src/index.ts',
        plugins: [commonjs(), resolve(), esbuild(), cleanup({ extensions: ['ts'] })],
        output: [
            {
                file: './dist/db/index.js',
                format: 'cjs',
                sourcemap: true,
            },
            {
                file: './dist/db/index.mjs',
                format: 'es',
                sourcemap: true,
            },
        ],
    }),
    bundle({
        input: './src/lib/evaluators/index.ts',
        plugins: [commonjs(), resolve(), esbuild(), cleanup({ extensions: ['ts'] })],
        output: [
            {
                file: './dist/evaluators/index.js',
                format: 'cjs',
                sourcemap: true,
            },
            {
                file: './dist/evaluators/index.mjs',
                format: 'es',
                sourcemap: true,
            },
        ],
    }),
    bundle({
        input: './src/index.ts',
        output: {
            file: './dist/types/db.d.ts',
            format: 'es',
        },
        plugins: [resolve(), commonjs(), cleanup({ extensions: ['.ts'] }), dts()],
    }),
    bundle({
        input: './src/lib/evaluators/index.ts',
        output: {
            file: './dist/types/evaluators.d.ts',
            format: 'es',
        },
        plugins: [resolve(), commonjs(), cleanup({ extensions: ['.ts'] }), dts()],
    }),
];
