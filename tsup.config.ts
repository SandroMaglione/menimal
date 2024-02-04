import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/bin.ts"],
  clean: true,
  publicDir: true,
  minify: true,
  format: ["cjs"],
});
