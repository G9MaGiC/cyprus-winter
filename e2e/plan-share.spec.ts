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

  // Share menu a11y wiring (batch 72): the trigger's accessible name IS its
  // visible label (WCAG 2.5.3 — no aria-label override; getByRole proves it),
  // aria-controls appears only while expanded (no dangling IDREF), and the
  // popover is a named group, not a menu widget (AUD-27).
  const shareTrigger = page.getByRole("button", { name: "Copy & share" });
  await expect(shareTrigger).toHaveAttribute("aria-expanded", "false");
  await expect(shareTrigger).not.toHaveAttribute("aria-haspopup");
  await expect(shareTrigger).not.toHaveAttribute("aria-controls");
  await shareTrigger.click();
  await expect(shareTrigger).toHaveAttribute("aria-expanded", "true");
  await expect(shareTrigger).toHaveAttribute("aria-controls", "plan-share-menu");
  const shareMenu = page.locator("#plan-share-menu");
  await expect(shareMenu).toBeVisible();
  await expect(shareMenu).toHaveAttribute("role", "group");
  await expect(shareMenu).toHaveAttribute("aria-label", /./);
});

test("Plan: a fresh visitor gets the whole-plan-empty welcome, not day-slot copy", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("cyprus-winter-onboarded", "true");
  });
  await page.goto("/plan");
  await expect(page.getByRole("main")).toBeVisible();
  // Batch 68 wired plan.addFirstPlace/plan.emptyDay for the zero-places case.
  await expect(page.getByRole("button", { name: "Add your first place" })).toBeVisible({
    timeout: 10000,
  });
  await expect(page.getByText(/Start with one place/)).toBeVisible();
});
