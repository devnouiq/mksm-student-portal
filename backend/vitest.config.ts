import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/*
  Unit + contract + HTTP-wrapper tests run in a Node environment with no
  network. Integration tests that touch the live database are opt-in via the
  MKSM_TEST_DB env flag and are otherwise skipped.
*/
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    hookTimeout: 30_000,
    testTimeout: 20_000,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@mksm/contracts": fileURLToPath(
        new URL("../packages/contracts/src/index.ts", import.meta.url),
      ),
    },
  },
});
