import { test, expect } from "@playwright/test";

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

  test("Hebrew /he/plan uses RTL and localized nav", async ({ page }) => {
    await page.goto("/he/plan", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/he\/plan/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "גילוי" })).toBeVisible();
  });

  test("Romanian /ro/discover loads with localized title", async ({ page }) => {
    await page.goto("/ro/discover", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/ro\/discover/);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Descoperă" })).toBeVisible();
  });

  test("French /fr/plan loads main content", async ({ page }) => {
    await page.goto("/fr/plan", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/fr\/plan/);
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("Hebrew winery book form shows localized submit", async ({ page }) => {
    await page.goto("/he/book/winery/tsiakkas", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/he\/book\/winery\/tsiakkas/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(
      page.getByRole("button", { name: /שלח בקשה|request booking/i })
    ).toBeVisible();
  });
});
