import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["**/node_modules/**", "**/e2e/**"],
    env: {
      MOONSHOT_API_KEY: "unit-test-placeholder-not-a-real-key",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "**/node_modules/**",
        "**/test/**",
        "**/*.d.ts",
        "**/*.test.ts",
        "**/*.test.tsx",
        "src/data/**", // Static data files
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      // Unit tests run outside the React Server environment, where the real
      // `server-only` module throws by design — stub it so server-only lib
      // modules (partner-overlay-store, the content overlays) stay testable.
      "server-only": resolve(__dirname, "./src/test/server-only-stub.ts"),
    },
  },
});
