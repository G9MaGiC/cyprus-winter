import { test, expect } from "@playwright/test";

/**
 * Plan add → share flow (critical conversion path per QA_PLAN.md).
 * Add place to plan, open share menu, copy link.
 */
test("Plan: add place and copy share link", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("cyprus-winter-onboarded", "true");
  });

  // Add place via URL (same as discover → add to plan)
  await page.goto("/plan?add=omodos");

  await expect(page).toHaveURL(/\/plan/);
  await expect(page.getByRole("main")).toBeVisible();

  // Wait for plan to show content
  const main = page.getByRole("main");
  await expect(main).toContainText(/Day 1|places|your plan/i, { timeout: 5000 });

  // Open Copy & share menu
  const shareButton = page.getByRole("button", {
    name: "Copy and share options",
  });
  await expect(shareButton).toBeVisible();
  await shareButton.click();

  // Click "Copy link" — copies share URL to clipboard and closes menu
  const copyLinkItem = page.getByRole("menuitem", {
    name: /Copy link|Link copied/,
  });
  await expect(copyLinkItem).toBeVisible();
  await copyLinkItem.click();

  // Menu closes after action; share flow completed
  await expect(page.getByRole("menu")).not.toBeVisible({ timeout: 2000 });
});
