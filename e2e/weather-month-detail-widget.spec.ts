import { test, expect, type Page } from "@playwright/test";

async function gotoStable(page: Page, url: string) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      return;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(400 * (attempt + 1));
    }
  }
  throw lastError;
}

test.describe("Weather month detail -> Right now widget", () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      // Keep widget deterministic for the test: show consent UI.
      try {
        localStorage.removeItem("cyprus-winter:location-consent");
      } catch {}
      try {
        localStorage.setItem("cyprus-winter-onboarded", "true");
      } catch {}
    });
  });

  test("shows Right now consent buttons on /weather/[month] and month jump links", async ({ page }) => {
    await gotoStable(page, "/weather/november");
    await expect(page.getByRole("main")).toBeVisible();

    await expect(page.getByTestId("right-now-primary")).toBeVisible();
    await expect(page.getByTestId("right-now-pick-region")).toBeVisible();

    // Month jump chips
    await expect(page.locator('a[href="/weather/december"]').first()).toBeVisible();
    await expect(page.locator('a[href="/weather/april"]').first()).toBeVisible();

    // Month-specific discovery chips (e.g., Monasteries)
    await expect(page.locator('a[href="/discover?filter=monastery"]')).toBeVisible();
  });
});

