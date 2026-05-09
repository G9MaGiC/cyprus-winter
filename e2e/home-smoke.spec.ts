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
