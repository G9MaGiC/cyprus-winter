import { test, expect } from "@playwright/test";

/**
 * Home UX smoke: pre-dismiss onboarding + cookies (same idea as discover-plan).
 * Keys: ONBOARDING_KEY / cookie consent — keep aligned with `src/lib/local-storage-keys` + cookie-consent.
 */
test("home shows hero entry points, search, and skip links", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("cyprus-winter-onboarded", "true");
    localStorage.setItem("cyprus-winter:cookie-consent", "all");
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveTitle(/Cyprus Winter/i, { timeout: 25_000 });

  /** Hero + Start here both link to family filter; footer may duplicate short-stay template. */
  await expect(page.locator('main a[href*="filter=family"]').first()).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator('main a[href*="template=short-stay"]').first()).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByText("Start here", { exact: true }).first()).toBeVisible({ timeout: 10_000 });

  /** Skip nav is off-screen until tab focus (`-translate-y-full`); assert presence in DOM. */
  await expect(page.locator('a[href="#this-week-heading"]')).toHaveCount(1);
  await expect(page.locator('a[href="#editors-picks-heading"]')).toHaveCount(1);
});

test("home hides editors picks when plan already has items", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("cyprus-winter-onboarded", "true");
    localStorage.setItem("cyprus-winter:cookie-consent", "all");
    localStorage.setItem(
      "cyprus-winter-itinerary",
      JSON.stringify({ "1": ["omodos"], "2": [], "3": [], "4": [], "5": [] })
    );
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.locator("#editors-picks-heading")).toHaveCount(0);
  await expect(page.locator("#book-tastings-heading")).toHaveCount(0);
});

test("home shows editors picks for new visitors without plan items", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("cyprus-winter-onboarded", "true");
    localStorage.setItem("cyprus-winter:cookie-consent", "all");
    localStorage.removeItem("cyprus-winter-itinerary");
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#editors-picks-heading")).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("#book-tastings-heading")).toBeVisible({ timeout: 10_000 });
});
