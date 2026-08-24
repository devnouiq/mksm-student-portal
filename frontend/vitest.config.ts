import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests run against pure logic only — Node environment, no DOM, no network.
// `@/` resolves the same way as the app's tsconfig path alias.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
