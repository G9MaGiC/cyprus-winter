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

test.describe("Performance baseline (paint + navigation)", () => {
  test("collect TTFB/FCP/LCP for key routes", async ({ page }) => {
    const initScript = () => {
      (window as any).__cwPerf = {
        fcp: null as number | null,
        lcp: null as number | null,
      };

      const update = (kind: "fcp" | "lcp", value: number) => {
        const current = (window as any).__cwPerf[kind];
        if (current == null || value < current) {
          (window as any).__cwPerf[kind] = value;
        }
      };

      try {
        // Capture paint entries for FCP.
        const paintObs = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const e = entry as PerformanceEntry & { name?: string };
            if (e.entryType === "paint" && e.name === "first-contentful-paint") {
              update("fcp", (e as any).startTime);
            }
          }
        });
        paintObs.observe({ type: "paint", buffered: true } as any);

        // Capture largest-contentful-paint.
        const lcpObs = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const e = entry as any;
            if (e.entryType === "largest-contentful-paint") {
              // startTime is relative to navigation start; this aligns with other timings below.
              update("lcp", e.startTime);
            }
          }
        });
        lcpObs.observe({ type: "largest-contentful-paint", buffered: true } as any);
      } catch {
        // If browser doesn't support these entries, we still return nav timings below.
      }
    };

    await page.addInitScript(initScript);

    const results: Record<string, unknown> = {};

    for (const route of ROUTES) {
      await page.goto(route.url, { waitUntil: "domcontentloaded" });

      // Give LCP/paint observers a brief chance to record buffered entries.
      // (We avoid strict time budgets here; this is only baseline capture.)
      try {
        await page.waitForFunction(
          () => (window as any).__cwPerf && (window as any).__cwPerf.lcp != null,
          { timeout: 8000 }
        );
      } catch {
        // Ignore timeout; we still fetch whatever we have.
      }

      const metrics = await page.evaluate(() => {
        const nav = performance.getEntriesByType("navigation")[0] as any;
        const timing = performance.timing as any;

        const t = {
          ttfbMs: null as number | null,
          fcpMs: (window as any).__cwPerf?.fcp ?? null,
          lcpMs: (window as any).__cwPerf?.lcp ?? null,
          domContentLoadedMs: null as number | null,
        };

        // Prefer Navigation Timing Level 2 if available.
        if (nav) {
          // navigation.startTime is used as a relative origin for entries.
          if (typeof nav.responseStart === "number" && typeof nav.startTime === "number") {
            t.ttfbMs = nav.responseStart - nav.startTime;
          }
          if (typeof nav.domContentLoadedEventEnd === "number" && typeof nav.startTime === "number") {
            t.domContentLoadedMs = nav.domContentLoadedEventEnd - nav.startTime;
          }
        } else if (timing) {
          // Fallback to legacy performance.timing.
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

    // Print results in a parseable format to the test output.
    // eslint-disable-next-line no-console
    console.log("PERF_BASELINE_RESULTS_JSON=" + JSON.stringify(results, null, 2));
  });
});

