import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import pkg from "./package.json";

const extensions = [".ts"];

export default [
  {
    input: "./index.ts",
    external: [/@babel\/runtime/],
    plugins: [
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
