import { test, expect } from "@playwright/test";

/**
 * Trail report flow: fill form, submit, assert success.
 */
test("Trail report: submit conditions", async ({ page }) => {
  await page.goto("/trails/artemis/report");

  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Report conditions/i })).toBeVisible();

  // Status and surface default to Open / Dry; we can submit as-is
  const submitBtn = page.getByRole("button", { name: /Submit report/i });
  await expect(submitBtn).toBeVisible();
  await submitBtn.click();

  await expect(page.getByText(/Thanks for reporting/i)).toBeVisible({ timeout: 5000 });
});
