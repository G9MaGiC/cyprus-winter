import { test, expect } from "@playwright/test";

/**
 * Plan → Book tasting flow (conversion path per QA_PLAN.md).
 * Add winery via URL, wait for card, click "Book a tasting", assert booking page.
 */
test("Plan: add winery and go to book tasting", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("cyprus-winter-onboarded", "true");
  });

  await page.goto("/plan?add=tsiakkas");

  await expect(page).toHaveURL(/\/plan/);
  await expect(page.getByRole("main")).toBeVisible();

  const main = page.getByRole("main");
  await expect(main).toContainText(/Day 1|places|your plan|Tsiakkas/i, { timeout: 5000 });

  const bookLink = page.getByRole("link", { name: /Book a tasting at Tsiakkas|Book a tasting/i });
  await expect(bookLink).toBeVisible();
  await bookLink.click();

  await expect(page).toHaveURL(/\/book\/winery\/tsiakkas/);
});
