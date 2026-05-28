import { test, expect } from "@playwright/test";

/**
 * Plan -> Book contract tests.
 */
test.describe("Plan -> Book", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("cyprus-winter-onboarded", "true");
    });
  });

  test("happy-path: add winery via plan query and navigate to booking", async ({ page }) => {
    await page.goto("/plan?add=tsiakkas");

    await expect(page).toHaveURL(/\/plan/);
    await expect(page.getByRole("main")).toBeVisible();

    const main = page.getByRole("main");
    await expect(main).toContainText(/Day 1|places|your plan|Tsiakkas/i, { timeout: 5000 });

    const bookLink = page.locator('a[href*="/book/winery/tsiakkas"]').filter({
      hasText: /Book a tasting/i,
    });
    await expect(bookLink).toBeVisible();
    const href = await bookLink.getAttribute("href");
    expect(href).toMatch(/\/book\/winery\/tsiakkas/);
    await page.goto(href!);

    await expect(page).toHaveURL(/\/book\/winery\/tsiakkas/);
  });

  test("contract: booking page has submit and bookings follow-up actions", async ({ page }) => {
    await page.goto("/book/winery/tsiakkas");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByLabel(/Preferred date/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Request booking/i })).toBeVisible();
  });

  test("resilience: back from booking returns to plan context", async ({ page }) => {
    await page.goto("/plan?add=tsiakkas");
    await page.getByRole("link", { name: /Book a tasting at Tsiakkas|Book a tasting/i }).click();
    await expect(page).toHaveURL(/\/book\/winery\/tsiakkas/);

    await page.goBack();
    await expect(page).toHaveURL(/\/plan/);
    await expect(page.getByRole("main")).toBeVisible();
  });
});
