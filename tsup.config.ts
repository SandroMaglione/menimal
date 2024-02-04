import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/bin.ts"],
  publicDir: false,
  clean: true,
  minify: true,
  format: ["cjs"],
});
