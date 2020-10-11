import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import typescript from 'rollup-plugin-typescript2'
import pkg from "./package.json";

const extensions = [".ts"];

export default [
  {
    input: "./index.ts",
    external: [/@babel\/runtime/],
    plugins: [
      typescript({
        typescript: require('typescript'),
        tsconfigOverride: { compilerOptions : { module: "es2015" } }
      }),
      resolve({
        extensions,
      }),
      babel({
        exclude: "node_modules/**",
        babelHelpers: "runtime",
        extensions,
      }),
    ],
    output: [
      {
        file: pkg.main,
        format: "cjs",
      },
      {
        file: pkg.module,
        format: "es",
      },
    ],
  },
];
