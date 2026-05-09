import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT) || 3000;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: process.env.CI ? "npm run build && npm run start" : "npm run dev",
    url: baseURL,
    reuseExistingServer: true,
    // CI runs `build && start`; on cold caches a full Next build + static gen can exceed 4m.
    timeout: process.env.CI ? 420_000 : 120_000,
  },
});
