import { test, expect } from "@playwright/test";

/**
 * P3-05: offline read-only plan — banner and disabled add actions.
 */
test.describe("Plan offline read-only", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("cyprus-winter-onboarded", "true");
      localStorage.setItem("cyprus-winter:cookie-consent", "all");
      localStorage.setItem(
        "cyprus-winter-itinerary",
        JSON.stringify({ "1": ["tsiakkas"] })
      );
    });
  });

  test("shows offline banner and hides sticky add bar", async ({ page }) => {
    await page.goto("/plan", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("main")).toBeVisible();

    // Sticky add bar appears once the add sentinel scrolls out of view (not at page bottom — footer hides it).
    // Scoped to the itinerary region: during streaming promotion the raw id
    // transiently resolves to two nodes (BUG-353 class) and a bare locator
    // aborts on strict mode; only the live copy is in the a11y tree.
    const sentinel = page
      .getByRole("region", { name: "Your plan" })
      .locator("#plan-add-sentinel");
    await sentinel.waitFor({ state: "attached" });
    // Scroll via the same region-scoped handle — a raw getElementById here
    // could still read offsetTop off a staged duplicate (BUG-353 class).
    await sentinel.evaluate((el) => {
      window.scrollTo(0, (el as HTMLElement).offsetTop + 120);
    });
    await expect(page.getByRole("complementary", { name: /add place/i })).toBeVisible({
      timeout: 10000,
    });

    await page.context().setOffline(true);

    // The banner hinges on one Chromium "offline" event — useOnlineStatus has
    // no poll or retry — so give it the same 10s the add-bar assert gets.
    await expect(
      page.getByRole("status").filter({ hasText: /offline|read-only/i })
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("complementary", { name: /add place/i })).toHaveCount(0);
  });
});
