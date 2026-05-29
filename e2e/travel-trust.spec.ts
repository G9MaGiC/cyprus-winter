import { test, expect } from "@playwright/test";

/**
 * CRISIS-01: travel trust module visible on plan with official-source links.
 */
test.describe("Travel trust strip", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("cyprus-winter-onboarded", "true");
    });
  });

  test("plan page shows official travel information", async ({ page }) => {
    await page.goto("/plan", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("complementary", { name: /official travel information/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /visit cyprus/i })).toBeVisible();
  });
});
