import { test, expect, type Page } from "@playwright/test";

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

test.describe("Discover filters", () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("cyprus-winter-onboarded", "true");
    });
  });

  test("activity filter shows curated places", async ({ page }) => {
    await gotoStable(page, "/discover?filter=bouldering");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("link", { name: /Gerakopetra|Ineia/i }).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test("mobile: filters collapse behind toggle", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chrome", "Collapsible filters are mobile-only");

    await gotoStable(page, "/discover?filter=climbing");
    const toggle = page.getByRole("button", { name: /Filters:/i });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("link", { name: /Rock climbing|Klettern|Αναρρίχηση/i })).toBeVisible();
  });

  test("list/map tabs support keyboard roving", async ({ page }) => {
    await gotoStable(page, "/discover");
    await expect(page.getByRole("main")).toBeVisible();

    const tablist = page.getByRole("tablist", {
      name: /View places as list or map|Orte als Liste|Wyświetl miejsca|Προβολή/i,
    });
    await expect(tablist).toBeVisible({ timeout: 20_000 });

    const listTab = page.getByRole("tab", { name: /^List$|^Liste$|^Lista$|^Λίστα$/i });
    const mapTab = page.getByRole("tab", { name: /^Map$|^Karte$|^Mapa$|^Χάρτης$/i });
    await expect(listTab).toBeVisible();
    await listTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(mapTab).toBeFocused();
  });

  test("?view=map loads map panel", async ({ page }) => {
    await gotoStable(page, "/discover?view=map");
    await expect(page.getByRole("main")).toBeVisible();
    const mapTab = page.getByRole("tab", { name: /^Map$|^Karte$|^Mapa$|^Χάρτης$/i });
    await expect(mapTab).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#discover-map")).toBeVisible({ timeout: 20_000 });
  });

  test("filter chip preserves view=map in URL", async ({ page }) => {
    await gotoStable(page, "/discover?view=map&filter=winery");
    await expect(page).toHaveURL(/view=map/);
    await expect(page).toHaveURL(/filter=winery/);
  });

  test("activity filter on map includes trail legend", async ({ page }) => {
    await gotoStable(page, "/discover?view=map&filter=bouldering");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("#discover-map")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Trail|Szlak|Μονοπάτι/i).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});
