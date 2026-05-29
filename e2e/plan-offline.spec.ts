import { test, expect } from "@playwright/test";

/**
 * P3-05: offline read-only plan — banner and disabled add actions.
 */
test.describe("Plan offline read-only", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("cyprus-winter-onboarded", "true");
      localStorage.setItem(
        "cyprus-winter-itinerary",
        JSON.stringify({ "1": ["tsiakkas"] })
      );
    });
  });

  test("shows offline banner and hides sticky add bar", async ({ page }) => {
    await page.goto("/plan", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("main")).toBeVisible();

    // Sticky add bar appears on mobile once the add sentinel scrolls out of view.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByRole("complementary", { name: /add place/i })).toBeVisible({
      timeout: 10000,
    });

    await page.context().setOffline(true);

    await expect(page.getByRole("status").filter({ hasText: /offline|read-only/i })).toBeVisible();
    await expect(page.getByRole("complementary", { name: /add place/i })).toHaveCount(0);
  });
});
