import { test, expect } from "@playwright/test";

/**
 * Discover → Detail flow (critical user journey per QA_PLAN.md).
 * Home → Discover → card → detail page.
 */
test("Discover to detail: can navigate to a place and see content", async ({
  page,
}) => {
  // Skip onboarding modal so it doesn't block the card click
  await page.addInitScript(() => {
    localStorage.setItem("cyprus-winter-onboarded", "true");
  });

  await page.goto("/");

  // Open Discover (via nav or direct)
  await page.goto("/discover", { waitUntil: "load" });

  // Dismiss onboarding modal if it appears (init script can race with hydrate)
  const skipButton = page.getByRole("button", { name: "Skip onboarding" });
  const exploreButton = page.getByRole("button", { name: "Start exploring places and trails" });
  if ((await skipButton.count()) > 0) {
    await skipButton.click();
  } else if ((await exploreButton.count()) > 0) {
    await exploreButton.click();
  }

  // Wait for discover list to load
  await expect(page.getByRole("main")).toBeVisible();

  // Cards live in #discover-content; section-reveal animates from opacity 0 for ~500ms
  const firstCard = page.locator('#discover-content a[href*="/discover/"]').first();
  await expect(firstCard).toBeVisible({ timeout: 20_000 });
  const href = await firstCard.getAttribute("href");
  expect(href).toMatch(/\/discover\/[a-z0-9-]+/);

  await Promise.all([
    page.waitForURL(/\/discover\/[a-z0-9-]+/, { timeout: 10000 }),
    firstCard.click(),
  ]);
  await expect(page.getByRole("main")).toBeVisible();

  // Detail should have heading (place name)
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toBeVisible();
  await expect(heading).not.toBeEmpty();
});
