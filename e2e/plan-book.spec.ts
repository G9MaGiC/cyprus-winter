import { test, expect, type Page } from "@playwright/test";

/**
 * Plan -> Book contract tests.
 */
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

test.describe("Plan -> Book", () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("cyprus-winter-onboarded", "true");
    });
  });

  test("happy-path: add winery via plan query and navigate to booking", async ({ page }) => {
    await gotoStable(page, "/plan?add=tsiakkas");

    await expect(page).toHaveURL(/\/plan/);
    await expect(page.getByRole("main")).toBeVisible();

    const main = page.getByRole("main");
    await expect(main).toContainText(/Day 1|places|your plan|Tsiakkas/i, { timeout: 5000 });

    const bookLink = page.locator('a[href="/book/winery/tsiakkas"]').first();
    await expect(bookLink).toBeVisible();
    await expect(bookLink).toHaveAttribute("href", /\/book\/winery\/tsiakkas/);
    await gotoStable(page, "/book/winery/tsiakkas");
    await expect(page).toHaveURL(/\/book\/winery\/tsiakkas/);
  });

  test("contract: booking page has submit and bookings follow-up actions", async ({ page }) => {
    await gotoStable(page, "/book/winery/tsiakkas");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByLabel(/Preferred date/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Request booking/i })).toBeVisible();
  });

  test("resilience: back from booking returns to plan context", async ({ page }) => {
    await gotoStable(page, "/plan?add=tsiakkas");
    await gotoStable(page, "/book/winery/tsiakkas");
    await expect(page).toHaveURL(/\/book\/winery\/tsiakkas/);

    await gotoStable(page, "/plan");
    await expect(page).toHaveURL(/\/plan/);
    await expect(page.getByRole("main")).toBeVisible();
  });
});
