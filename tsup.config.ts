import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/bin.ts"],
  clean: true,
  publicDir: "src/templates",
  minify: true,
  format: ["cjs"],
});
