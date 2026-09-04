import { test, expect } from "@playwright/test";

/**
 * Route smoke: every page must server-render without hitting the error
 * boundary. The error page returns HTTP 200, so status checks alone never
 * catch a broken route — BUG-349 (/guides/troodos-december) and BUG-350
 * (/install) shipped crashed for weeks this way. An SSR failure embeds an
 * RSC error digest ("digest":"<number>") in the HTML payload; assert its
 * absence on every route alongside a sanity marker that content rendered.
 */

const ROUTES = [
  "/",
  "/airport",
  "/beaches",
  "/book/winery",
  "/book/winery/tsiakkas",
  "/book/guide",
  "/book/guide/troodos-guides",
  "/bookings",
  "/cycling",
  "/discover",
  "/discover/nissi-beach",
  "/discover/omodos",
  "/events",
  "/forgot-password",
  "/guides/directory",
  "/guides/troodos-december",
  "/install",
  "/login",
  "/nature",
  "/plan",
  "/privacy",
  "/regions/troodos",
  "/regions/paphos",
  "/register",
  "/search",
  "/secrets",
  "/team",
  "/partner/join",
  "/terms",
  "/trails",
  "/trails/artemis",
  "/trails/artemis/report",
  "/villages",
  "/weather",
  "/weather/december",
  "/wine-routes",
  "/wine-routes/krasochoria",
  "/wineries",
  // Locale spot checks (full-locale coverage lives in locale-prefixed-route.spec.ts)
  "/he",
  "/he/install",
  "/el/guides/troodos-december",
];

// Escaped inside the RSC flight payload as \"digest\":\"1234…\"; plain in dev.
const SSR_ERROR_DIGEST = /digest\\?":\\?"\d+/;

test.describe("route smoke — no silent SSR errors", () => {
  test.setTimeout(180_000);

  test("all routes render without an error digest", async ({ request }) => {
    const failures: string[] = [];
    for (const route of ROUTES) {
      const res = await request.get(route, { timeout: 30_000 });
      const body = await res.text();
      if (res.status() !== 200) {
        failures.push(`${route}: HTTP ${res.status()}`);
      } else if (SSR_ERROR_DIGEST.test(body)) {
        failures.push(`${route}: SSR error digest in payload`);
      } else if (!body.includes("</html>") || !body.includes("main")) {
        failures.push(`${route}: incomplete document`);
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
});
