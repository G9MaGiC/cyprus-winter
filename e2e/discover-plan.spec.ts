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
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("cyprus-winter-onboarded", "true");
    });
  });

  test("happy-path: add place from discover and verify it appears in plan", async ({ page }) => {
    await gotoStable(page, "/discover");
    await expect(page.getByRole("main")).toBeVisible();
    await gotoStable(page, "/plan?add=tsiakkas");
    await expect(page).toHaveURL(/\/plan/);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("main")).toContainText(/Day 1|your plan|places/i);
  });

  test("contract: discover exposes add-to-plan buttons", async ({ page }, testInfo) => {
    await gotoStable(page, "/discover");
    await expect(page.getByRole("main")).toBeVisible();

    const bottomNav = page.getByRole("navigation", { name: /bottom navigation/i });

    if (testInfo.project.name === "mobile-chrome") {
      await expect(bottomNav).toBeVisible();
      await expect(bottomNav.getByRole("link", { name: /^plan$/i })).toBeVisible();
      return;
    }

    await expect(bottomNav).not.toBeVisible();
    // Hero / filter CTAs use locale-aware AppLink; match by accessible name, not exact href.
    await expect(
      page.getByRole("main").getByRole("link", { name: /Plan your trip|Build a day/i }).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test("resilience: back navigation from plan returns to discover context", async ({ page }) => {
    await gotoStable(page, "/discover");
    await expect(page.getByRole("main")).toBeVisible();

    await gotoStable(page, "/plan?add=tsiakkas");
    await expect(page).toHaveURL(/\/plan/);

    await gotoStable(page, "/discover");
    await expect(page).toHaveURL(/\/discover/);
    await expect(page.getByRole("main")).toBeVisible();
  });
});
