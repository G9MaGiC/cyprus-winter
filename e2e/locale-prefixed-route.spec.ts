import { test, expect, type Page } from "@playwright/test";

/**
 * Smoke: locale-prefixed URLs resolve through proxy + next-intl (regression guard for intl middleware).
 */
test.describe("Locale-prefixed routes", () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("cyprus-winter-onboarded", "true");
    });
  });

  test("German /de/plan loads main content", async ({ page }) => {
    await page.goto("/de/plan", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/de\/plan/);
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("Hebrew /he/plan uses RTL and localized nav", async ({ page }, testInfo) => {
    await page.goto("/he/plan", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/he\/plan/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("main")).toBeVisible();
    const nav = page.getByRole("navigation", { name: "ניווט ראשי" });
    if (testInfo.project.name.includes("mobile")) {
      await nav.getByRole("button", { name: "פתחו תפריט" }).click();
    }
    await expect(nav.getByRole("link", { name: "גילוי" })).toBeVisible();
  });

  test("Romanian /ro/discover loads with localized title", async ({ page }, testInfo) => {
    await page.goto("/ro/discover", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/ro\/discover/);
    await expect(page.getByRole("main")).toBeVisible();
    const nav = page.getByRole("navigation", { name: "Navigare principală" });
    if (testInfo.project.name.includes("mobile")) {
      await nav.getByRole("button", { name: "Deschide meniul" }).click();
    }
    await expect(nav.getByRole("link", { name: "Descoperă" })).toBeVisible();
  });

  test("French /fr/plan loads main content", async ({ page }) => {
    await page.goto("/fr/plan", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/fr\/plan/);
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("German winery booking list resolves before localized detail back navigation", async ({ page }) => {
    const response = await page.goto("/de/book/winery", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/de\/book\/winery/);
    await expect(page.getByRole("main")).toBeVisible();
  });

  async function expandDiscoverFiltersIfMobile(page: Page) {
    const toggle = page.locator("#discover-filters-toggle");
    if (await toggle.isVisible()) {
      await toggle.click();
    }
    await expect(page.locator("#discover-filters")).toBeVisible({ timeout: 15_000 });
  }

  async function expectDiscoverFilterChipsVisible(page: Page, groupName: string | RegExp) {
    await expect(async () => {
      await expandDiscoverFiltersIfMobile(page);
      const filters = page.getByRole("group", { name: groupName });
      await expect(filters).toBeVisible({ timeout: 10_000 });
      await expect(filters.getByRole("link").first()).toBeVisible({ timeout: 10_000 });
    }).toPass({ timeout: 45_000 });
  }

  test("German discover filter chips visible at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/de/discover", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("main")).toBeVisible();
    await expectDiscoverFilterChipsVisible(page, "Nach Kategorie filtern");
  });

  test("Hebrew discover filter chips visible at 390px RTL", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/he/discover", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("main")).toBeVisible();
    await expectDiscoverFilterChipsVisible(page, "סינון לפי סוג מקום");
  });

  test("Polish discover filter chips visible at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/pl/discover", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("main")).toBeVisible();
    await expectDiscoverFilterChipsVisible(page, "Filtruj według kategorii");
  });
});
