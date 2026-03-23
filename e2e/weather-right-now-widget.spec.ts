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

test.describe("Weather -> Right now widget", () => {
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

  test("shows location consent buttons on /weather", async ({ page }) => {
    await gotoStable(page, "/weather");
    await expect(page.getByRole("main")).toBeVisible();

    // RightNowNearYou uses LocationActionButtons with these test ids.
    await expect(page.getByTestId("right-now-primary")).toBeVisible();
    await expect(page.getByTestId("right-now-pick-region")).toBeVisible();
  });
});

