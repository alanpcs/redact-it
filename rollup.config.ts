import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript'; // <-- fix here
import pkg from './package.json';

const extensions = ['.ts'];

export default [
  {
    input: './index.ts',
    external: [/@babel\/runtime/],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true,
      }),
      resolve({
        extensions,
      }),
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'runtime',
        extensions,
      }),
    ],
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
      },
    ],
  },
];
