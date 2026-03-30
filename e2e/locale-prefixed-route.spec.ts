import { test, expect } from "@playwright/test";

/**
 * Smoke: locale-prefixed URLs resolve through proxy + next-intl (regression guard for intl middleware).
 */
test.describe("Locale-prefixed routes", () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("cyprus-winter-onboarded", "true");
    });
  });

  test("German /de/plan loads main content", async ({ page }) => {
    await page.goto("/de/plan", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/de\/plan/);
    await expect(page.getByRole("main")).toBeVisible();
  });
});
