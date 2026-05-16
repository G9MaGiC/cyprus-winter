import { test, expect } from "@playwright/test";

test.describe("Hub footer Ask AI", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("cyprus-winter-onboarded", "true");
      localStorage.setItem("cyprus-winter:cookie-consent", "all");
    });
  });

  test("beaches footer Ask AI opens Cyprus Guide dialog", async ({ page }) => {
    await page.goto("/beaches");
    await expect(page.getByRole("main")).toBeVisible();

    const hubFooter = page.locator('footer[aria-label="Beaches page actions"]');
    await hubFooter.scrollIntoViewIfNeeded();
    await hubFooter.getByRole("button", { name: /ask ai for trip suggestions/i }).click();

    await expect(page.getByRole("dialog", { name: /Cyprus Guide/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
