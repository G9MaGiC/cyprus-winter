import { test } from "@playwright/test";

test.describe("Network prefetch during initial load", () => {
  test("counts Next data prefetches on home", async ({ page }) => {
    const urls: string[] = [];
    page.on("request", (r) => {
      urls.push(r.url());
    });

    await page.goto("/", { waitUntil: "load" });

    // Allow a bit of time for prefetches triggered by visible links to begin.
    // This is measurement only; no assertions on performance budgets here.
    await page.waitForTimeout(2000);

    const summary = await page.evaluate((raw: string[]) => {
      const uniq = new Set(raw);
      const nextData = [...uniq].filter((u) => u.includes("/_next/data/"));
      const nextStatic = [...uniq].filter((u) => u.includes("/_next/static/"));
      const apiRoutes = [...uniq].filter((u) => u.includes("/api/"));
      return {
        uniqueRequestCount: uniq.size,
        uniqueNextDataCount: nextData.length,
        uniqueNextStaticCount: nextStatic.length,
        uniqueApiCount: apiRoutes.length,
        sampleNextData: nextData.slice(0, 10),
      };
    }, urls);

    console.log("PREFETCH_WATERFALL_SUMMARY_JSON=" + JSON.stringify(summary, null, 2));
  });
});

