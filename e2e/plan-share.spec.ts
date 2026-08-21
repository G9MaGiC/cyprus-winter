import { test, expect } from "@playwright/test";

/**
 * Plan add → share flow (critical conversion path per QA_PLAN.md).
 * Add place to plan, open share menu, copy link.
 */
test("Plan: add place and copy share link", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
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

  // Copy share link (button moved out of menu)
  const copyLinkButton = page.getByRole("button", {
    name: /Copy link|Link copied/i,
  });
  await expect(copyLinkButton).toBeVisible();
  await copyLinkButton.click();
  await expect(copyLinkButton).toHaveClass(/ring-terracotta/);
  await expect(copyLinkButton).toContainText(/Link copied/i);
});
