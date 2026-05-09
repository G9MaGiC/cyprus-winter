import { test } from "@playwright/test";

type Route = {
  name: string;
  url: string;
};

const ROUTES: Route[] = [
  { name: "home", url: "/" },
  { name: "discover", url: "/discover" },
  { name: "plan", url: "/plan" },
  { name: "login", url: "/login" },
];

type CwPerf = { fcp: number | null; lcp: number | null };

type WindowWithCwPerf = Window & { __cwPerf: CwPerf };

test.describe("Performance baseline (paint + navigation)", () => {
  test("collect TTFB/FCP/LCP for key routes", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as WindowWithCwPerf;
      w.__cwPerf = {
        fcp: null,
        lcp: null,
      };

      const update = (kind: keyof CwPerf, value: number) => {
        const current = w.__cwPerf[kind];
        if (current == null || value < current) {
          w.__cwPerf[kind] = value;
        }
      };

      try {
        const paintObs = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === "paint" && entry.name === "first-contentful-paint") {
              update("fcp", entry.startTime);
            }
          }
        });
        paintObs.observe({ type: "paint", buffered: true });

        const lcpObs = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === "largest-contentful-paint") {
              update("lcp", entry.startTime);
            }
          }
        });
        lcpObs.observe({ type: "largest-contentful-paint", buffered: true });
      } catch {
        // If browser doesn't support these entries, we still return nav timings below.
      }
    });

    const results: Record<string, unknown> = {};

    for (const route of ROUTES) {
      await page.goto(route.url, { waitUntil: "domcontentloaded" });

      try {
        await page.waitForFunction(() => {
          const cw = (window as unknown as { __cwPerf?: { lcp: number | null } }).__cwPerf;
          return cw != null && cw.lcp != null;
        }, { timeout: 8000 });
      } catch {
        // Ignore timeout; we still fetch whatever we have.
      }

      const metrics = await page.evaluate(() => {
        const perf = (window as unknown as { __cwPerf?: CwPerf }).__cwPerf;

        const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
        const timing = performance.timing;

        const t = {
          ttfbMs: null as number | null,
          fcpMs: perf?.fcp ?? null,
          lcpMs: perf?.lcp ?? null,
          domContentLoadedMs: null as number | null,
        };

        if (nav) {
          if (typeof nav.responseStart === "number" && typeof nav.startTime === "number") {
            t.ttfbMs = nav.responseStart - nav.startTime;
          }
          if (typeof nav.domContentLoadedEventEnd === "number" && typeof nav.startTime === "number") {
            t.domContentLoadedMs = nav.domContentLoadedEventEnd - nav.startTime;
          }
        } else if (timing) {
          if (typeof timing.responseStart === "number" && typeof timing.navigationStart === "number") {
            t.ttfbMs = timing.responseStart - timing.navigationStart;
          }
          if (typeof timing.domContentLoadedEventEnd === "number" && typeof timing.navigationStart === "number") {
            t.domContentLoadedMs = timing.domContentLoadedEventEnd - timing.navigationStart;
          }
        }

        return t;
      });

      results[route.name] = metrics;
    }

    console.log("PERF_BASELINE_RESULTS_JSON=" + JSON.stringify(results, null, 2));
  });
});
