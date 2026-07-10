import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  // Keep peers + heavy SDK deps external so host apps dedupe a single copy.
  external: [
    "react",
    "react-dom",
    "wagmi",
    "viem",
    "@tanstack/react-query",
  ],
});
