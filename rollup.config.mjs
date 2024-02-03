import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/bin.ts",
  output: {
    dir: "bin",
    format: "cjs",
  },
  plugins: [typescript()],
};
