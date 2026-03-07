/** Vitest setup: ensure chat API route can run validation tests (503 is skipped when key is set) */
if (!process.env.MOONSHOT_API_KEY) {
  process.env.MOONSHOT_API_KEY = "test-key-for-unit-tests";
}
