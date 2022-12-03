/** @format */

import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import cleanup from 'rollup-plugin-cleanup';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import pkg from '../package.json' assert { type: 'json' };

const bundle = (config) => ({
    plugins: [commonjs(), resolve(), esbuild(), cleanup({ extensions: ['ts'] })],
    external: (id) => !/^[./]/.test(id),
    ...config,
});

const types = (config) => ({
    plugins: [resolve(), commonjs(), cleanup({ extensions: ['.ts'] }), dts()],
    external: (id) => !/^[./]/.test(id),
    ...config,
});

export default [
    bundle({
        input: './src/index.ts',
        output: [
            {
                file: './dist/index.js',
                format: 'cjs',
                sourcemap: true,
            },
            {
                file: './dist/index.mjs',
                format: 'es',
                sourcemap: true,
            },
        ],
    }),
    bundle({
        input: './src/lib/Db/index.ts',
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
        input: './src/lib/Evaluators/index.ts',
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
        input: './src/lib/Validators/index.ts',
        output: [
            {
                file: './dist/validators/index.js',
                format: 'cjs',
                sourcemap: true,
            },
            {
                file: './dist/validators/index.mjs',
                format: 'es',
                sourcemap: true,
            },
        ],
    }),
    types({
        input: './src/index.ts',
        output: {
            file: './dist/types/index.d.ts',
            format: 'es',
        },
    }),
    types({
        input: './src/lib/Db/index.ts',
        output: {
            file: './dist/types/db.d.ts',
            format: 'es',
        },
    }),
    types({
        input: './src/lib/Evaluators/index.ts',
        output: {
            file: './dist/types/evaluators.d.ts',
            format: 'es',
        },
    }),
    types({
        input: './src/lib/Validators/index.ts',
        output: {
            file: './dist/types/validators.d.ts',
            format: 'es',
        },
    }),
];
