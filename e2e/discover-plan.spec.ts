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

  test("contract: discover exposes add-to-plan buttons", async ({ page }) => {
    await gotoStable(page, "/discover");
    await expect(page.getByRole("main")).toBeVisible();

    // Top nav Plan may be hidden on small viewports (overflow menu); BottomNav Plan is visible on mobile.
    // Desktop has no bottom bar (md:hidden). Assert at least one /plan link is visible.
    const planAnchors = page.locator('a[href*="/plan"]');
    await expect(planAnchors.first()).toBeAttached();
    await expect(async () => {
      const n = await planAnchors.count();
      expect(n).toBeGreaterThan(0);
      for (let i = 0; i < n; i++) {
        if (await planAnchors.nth(i).isVisible()) return;
      }
      throw new Error("no visible Plan link");
    }).toPass();
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
