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
    // Role-scoped: the CSS id can transiently resolve to 2 nodes while Next
    // promotes the streamed segment from its hidden container (BUG-353);
    // the accessibility tree only ever holds the live one.
    await expect(
      page.getByRole("region", { name: /Places on map|Orte auf der Karte|Μέρη στον χάρτη|Miejsca na mapie/i })
    ).toBeVisible({ timeout: 20_000 });
  });

  test("filter chip preserves view=map in URL", async ({ page }) => {
    await gotoStable(page, "/discover?view=map&filter=winery");
    await expect(page).toHaveURL(/view=map/);
    await expect(page).toHaveURL(/filter=winery/);
  });

  test("activity filter on map includes trail legend", async ({ page }) => {
    await gotoStable(page, "/discover?view=map&filter=bouldering");
    await expect(page.getByRole("main")).toBeVisible();
    // Hydration can race the ?view=map URL state under full-suite load; make the
    // map tab active deterministically instead of polling a hidden section.
    const mapTab = page.getByRole("tab", { name: /^Map$|^Karte$|^Mapa$|^Χάρτης$/i });
    await expect(mapTab).toBeVisible({ timeout: 20_000 });
    if ((await mapTab.getAttribute("aria-selected")) !== "true") {
      await mapTab.click();
    }
    await expect(mapTab).toHaveAttribute("aria-selected", "true", { timeout: 20_000 });
    const mapSection = page.getByRole("region", {
      name: /Places on map|Orte auf der Karte|Μέρη στον χάρτη|Miejsca na mapie/i,
    });
    await expect(mapSection).toBeVisible({ timeout: 20_000 });
    const legend = mapSection.getByRole("list", {
      name: /Map marker types|Markertypen|Τύποι δεικτών|Typy znaczników/i,
    });
    await expect(legend).toBeVisible({ timeout: 20_000 });
    await expect(legend.getByText(/^Trail$|^Szlak$|^Μονοπάτι$|^Sentier$/i)).toBeVisible();
  });
});
