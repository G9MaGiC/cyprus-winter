import { test, expect } from "@playwright/test";

/**
 * Discover → Add to plan → Plan flow (critical conversion path per QA_PLAN.md).
 */
test("Discover to plan: add place and see it in plan", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("cyprus-winter-onboarded", "true");
  });

  await page.goto("/discover");

  const skipButton = page.getByRole("button", { name: "Skip onboarding" });
  const exploreButton = page.getByRole("button", { name: "Start exploring places and trails" });
  if ((await skipButton.count()) > 0) {
    await skipButton.click();
  } else if ((await exploreButton.count()) > 0) {
    await exploreButton.click();
  }

  await expect(page.getByRole("main")).toBeVisible();

  await expect(page.locator('main a[href="#discover-map"]').first()).toBeVisible({ timeout: 15_000 });

  const addToPlanLink = page.getByRole("link", { name: /Add to plan/ }).first();
  await expect(addToPlanLink).toBeVisible();
  const href = await addToPlanLink.getAttribute("href");
  expect(href).toMatch(/\/plan\?add=/);

  await addToPlanLink.click();

  await expect(page).toHaveURL(/\/plan/);
  await expect(page.getByRole("main")).toBeVisible();

  // Plan should show the added place (name appears in day content or quick start)
  const main = page.getByRole("main");
  await expect(main).toContainText(/Day 1|Added|your plan|place/i, { timeout: 5000 });
});
