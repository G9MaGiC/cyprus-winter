import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT) || 3000;

/**
 * Bind Next with an explicit `--hostname` so it skips `os.networkInterfaces()` (can throw in sandboxes).
 * Use `localhost` (not `127.0.0.1`) for the dev URL: CSP includes `upgrade-insecure-requests`, and Chromium
 * can mis-handle `http://127.0.0.1` with that policy (redirect loops in dev).
 */
const devHost = "localhost";
const baseURL = `http://${devHost}:${port}`;
const nextHostArgs = `--hostname ${devHost} -p ${port}`;

// Ensure the test fixture resolves baseURL (see playwright `baseURL` fixture + webServer env rules).
process.env.PLAYWRIGHT_TEST_BASE_URL = baseURL;

/**
 * Invoke Next via `node …/next` (not `npm run dev`): Playwright spawns the webServer with
 * `shell: true` and only a stdin pipe; npm has been observed to sit for minutes before the
 * server responds on the readiness URL.
 */
const nextCli = "node ./node_modules/next/dist/bin/next";

/** Core funnel specs — also run on mobile Chromium viewport (touch + narrow layout) without WebKit (BUG-078). */
const coreFunnelGlobs = [
  "**/arrival-decision-flow.spec.ts",
  "**/discover-plan.spec.ts",
  "**/plan-book.spec.ts",
  "**/bookings.spec.ts",
  "**/locale-prefixed-route.spec.ts",
] as const;

const mobileUxGlobs = [
  "**/hub-footer.spec.ts",
  "**/overlay-precedence.spec.ts",
  "**/home-smoke.spec.ts",
] as const;

export default defineConfig({
  testDir: "./e2e",
  /** First dev hit per route can compile 30–60s+ on cold Turbopack. */
  timeout: 120_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
      testMatch: [...coreFunnelGlobs, ...mobileUxGlobs],
    },
  ],
  webServer: {
    command: process.env.CI
      ? `npm run build && ${nextCli} start ${nextHostArgs}`
      : `${nextCli} dev ${nextHostArgs}`,
    url: baseURL,
    reuseExistingServer: true,
    // Dev: HTTP GET / can wait on first compile; resolve as soon as Turbopack reports listening.
    ...(process.env.CI ? {} : { wait: { stdout: /Ready in/i } }),
    // CI runs `build && start`; on cold caches a full Next build + static gen can exceed 4m.
    timeout: process.env.CI ? 420_000 : 120_000,
  },
});
