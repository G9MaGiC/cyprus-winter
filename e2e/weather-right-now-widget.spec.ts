import { test, expect, type Page } from "@playwright/test";

// The widget can render a CSS-hidden responsive twin, so a bare testid
// locator trips strict mode (b73 flake) — same cure as the month-detail
// sibling spec: only the visible instance counts.
function visibleTestId(page: Page, testId: string) {
  return page.locator(`[data-testid="${testId}"]:visible`);
}

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
    await expect(visibleTestId(page, "right-now-primary")).toBeVisible();
    await expect(visibleTestId(page, "right-now-pick-region")).toBeVisible();
  });
});

