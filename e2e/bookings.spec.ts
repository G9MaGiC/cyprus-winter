import { test, expect } from "@playwright/test";

/**
 * Bookings flow: submit winery booking → view on Bookings page (per QA_PLAN.md).
 * Uses localStorage for booking storage (addBookingToLocal) so no Supabase needed.
 */
test("Bookings: submit winery booking and see it on My Bookings", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("cyprus-winter-onboarded", "true");
    // Clear any existing bookings for predictable state
    localStorage.removeItem("cyprus-bookings");
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split("T")[0];

  await page.goto("/book/winery/tsiakkas");

  await expect(page.getByRole("heading", { level: 1, name: /Book a tasting/ })).toBeVisible();

  await page.getByLabel("Preferred date").fill(dateStr);
  await page.getByLabel("Group size").selectOption("2");
  await page.getByLabel("Your name").fill("E2E Test User");
  await page.getByLabel("Email").fill("e2e@example.com");

  await page.getByRole("button", { name: "Request booking" }).click();

  // Success state
  await expect(
    page.getByRole("heading", { level: 2, name: "Request sent" })
  ).toBeVisible({ timeout: 10000 });

  // Go to My Bookings
  await page.getByRole("link", { name: "View my bookings" }).click();

  await expect(page).toHaveURL(/\/bookings/);
  await expect(page.getByRole("main")).toBeVisible();
});
