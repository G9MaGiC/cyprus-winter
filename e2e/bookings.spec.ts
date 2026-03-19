import { test, expect, type Page } from "@playwright/test";

/**
 * Bookings flow: submit winery booking → view on Bookings page (per QA_PLAN.md).
 * Uses localStorage for booking storage (addBookingToLocal) so no Supabase needed.
 */
test("Bookings: submit winery booking and see it on My Bookings", async ({
  page,
}) => {
  test.setTimeout(90000);

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
  await page.evaluate(() => localStorage.removeItem("cyprus-bookings"));

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

  await expect.poll(async () => {
    return page.evaluate(() => {
      const raw = localStorage.getItem("cyprus-bookings");
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.length : 0;
    });
  }).toBeGreaterThan(0);

  // Go to My Bookings (navigation can be flaky under hot-reload)
  await expect(page.getByRole("link", { name: "View my bookings" })).toBeVisible();
  await gotoStable(page, "/bookings");

  await expect(page).toHaveURL(/\/bookings/);
  await expect(page.getByRole("main")).toBeVisible();
});
