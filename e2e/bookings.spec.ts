import { test, expect, type Page } from "@playwright/test";

/**
 * Bookings flow: submit winery booking → view on Bookings page (per QA_PLAN.md).
 * Uses localStorage for booking storage (addBookingToLocal) so no Supabase needed.
 */
test("Bookings: submit winery booking and see it on My Bookings", async ({
  page,
}) => {
  async function gotoStable(currentPage: Page, url: string) {
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await currentPage.goto(url, { waitUntil: "domcontentloaded" });
        return;
      } catch (error) {
        lastError = error;
        await currentPage.waitForTimeout(400 * (attempt + 1));
      }
    }
    throw lastError;
  }

  await page.addInitScript(() => {
    localStorage.setItem("cyprus-winter-onboarded", "true");
    // Clear any existing bookings for predictable state
    localStorage.removeItem("cyprus-bookings");
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split("T")[0];

  // Keep this flow deterministic in CI/local by mocking booking API success.
  await page.route("**/api/bookings", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          storage: "database",
          booking: {
            id: "e2e-booking-1",
            type: "winery_tasting",
            providerId: "tsiakkas",
            providerName: "Tsiakkas Winery",
            date: dateStr,
            partySize: 2,
            guestEmail: "e2e@example.com",
            guestName: "E2E Test User",
            status: "pending",
            createdAt: new Date().toISOString(),
          },
        }),
      });
      return;
    }
    await route.continue();
  });

  await gotoStable(page, "/book/winery/tsiakkas");

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
  await expect(page.getByRole("main")).toContainText("Tsiakkas Winery");
  await expect(page.getByRole("main")).toContainText(/Pending|pending/i);
});
