import { test, expect, type Page } from "@playwright/test";

/**
 * Discover -> Plan contract tests.
 */
async function gotoStable(page: Page, url: string) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      return;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(400 * (attempt + 1));
    }
  }
  throw lastError;
}

test.describe("Discover -> Plan", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("cyprus-winter-onboarded", "true");
    });
  });

  test("happy-path: add place from discover and verify it appears in plan", async ({ page }) => {
    await gotoStable(page, "/discover");

    const skipButton = page.getByRole("button", { name: "Skip onboarding" });
    const exploreButton = page.getByRole("button", { name: "Start exploring places and trails" });
    if ((await skipButton.count()) > 0) {
      await skipButton.click();
    } else if ((await exploreButton.count()) > 0) {
      await exploreButton.click();
    }

    await expect(page.getByRole("main")).toBeVisible();

    const card = page.locator("main .group").first();
    const placeName = (await card.getByRole("heading", { level: 3 }).textContent())?.trim() ?? "";
    const addToPlanButton = card.getByRole("button", { name: /Add to plan/i }).first();
    await expect(addToPlanButton).toBeVisible();
    await addToPlanButton.click({ force: true });

    await gotoStable(page, "/plan");
    await expect(page).toHaveURL(/\/plan/);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("main")).toContainText(placeName, { timeout: 5000 });
  });

  test("contract: discover exposes add-to-plan buttons", async ({ page }) => {
    await gotoStable(page, "/discover");
    await expect(page.getByRole("main")).toBeVisible();

    const addToPlanButtons = page.getByRole("button", { name: /Add to plan/i });
    await expect(addToPlanButtons.first()).toBeVisible();
  });

  test("resilience: back navigation from plan returns to discover context", async ({ page }) => {
    await gotoStable(page, "/discover");
    await expect(page.getByRole("main")).toBeVisible();

    const addToPlanButton = page.getByRole("button", { name: /Add to plan/i }).first();
    await addToPlanButton.click({ force: true });
    await gotoStable(page, "/plan");
    await expect(page).toHaveURL(/\/plan/);

    await page.goBack();
    await expect(page).toHaveURL(/\/discover/);
    await expect(page.getByRole("main")).toBeVisible();
  });
});
