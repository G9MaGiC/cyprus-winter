import { test, expect, type Page } from "@playwright/test";

/**
 * Arrival flow contract tests using stable test ids.
 */
function visibleTestId(page: Page, testId: string) {
  return page.locator(`[data-testid="${testId}"]:visible`);
}

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

test.describe("Arrival decision flow", () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("cyprus-winter-onboarded", "true");
    });
  });

  test("arrival-happy-path: home airport CTA and plan handoff are reachable", async ({
    page,
  }) => {
    await gotoStable(page, "/");
    await expect(page.getByRole("main")).toBeVisible();

    const airportCta = visibleTestId(page, "home-hero-airport-cta");
    await expect(airportCta).toBeVisible();
    await airportCta.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForURL(/\/airport/, { timeout: 20_000 }),
      airportCta.click(),
    ]);
    await expect(page.getByRole("main")).toBeVisible();

    const picker = page.locator(
      '[data-testid="airport-picker-lca"]:visible, [data-testid="airport-picker-pfo"]:visible'
    );
    await expect(picker.first()).toBeVisible();

    const planHeroCta = visibleTestId(page, "airport-hero-plan48-cta");
    await expect(planHeroCta).toBeVisible();
    await expect(planHeroCta).toHaveAttribute("href", /\/plan\?template=short-stay/);
    const quickPlanCta = visibleTestId(page, "airport-quick-plan");
    await expect(quickPlanCta).toBeVisible();
    await quickPlanCta.click({ force: true });
    await expect(page).toHaveURL(/\/plan(\?template=short-stay)?$/);
  });

  test("arrival-fallback-path: alternate airport picker branch is usable", async ({ page }) => {
    await gotoStable(page, "/airport");
    await expect(page.getByRole("main")).toBeVisible();

    const lcaPicker = visibleTestId(page, "airport-picker-lca");
    const pfoPicker = visibleTestId(page, "airport-picker-pfo");

    await expect(lcaPicker).toBeVisible();
    await expect(pfoPicker).toBeVisible();

    await pfoPicker.click();
    await expect(page).toHaveURL(/#airport-PFO$/);

    await lcaPicker.click();
    await expect(page).toHaveURL(/#airport-LCA$/);
  });

  test("arrival-resilience: back and refresh preserve core actionability", async ({ page }) => {
    await gotoStable(page, "/");
    await Promise.all([
      page.waitForURL(/\/airport/, { timeout: 15000 }),
      visibleTestId(page, "home-hero-airport-cta").click({ force: true }),
    ]);

    await page.goBack();
    await expect(page).toHaveURL(/\/($|[a-z]{2}$)/);
    await expect(visibleTestId(page, "home-hero-airport-cta")).toBeVisible();

    await gotoStable(page, "/airport");
    await page.reload({ waitUntil: "domcontentloaded" });

    await expect(visibleTestId(page, "airport-hero-plan48-cta")).toBeVisible();
    await expect(visibleTestId(page, "airport-quick-weather")).toBeVisible();
    await expect(visibleTestId(page, "airport-quick-discover")).toBeVisible();
    await expect(visibleTestId(page, "airport-footer-discover-cta")).toBeVisible();
  });

  test("arrival-cta-contract: key test IDs and hrefs remain stable", async ({ page }) => {
    await gotoStable(page, "/");
    await expect(visibleTestId(page, "home-hero-explore-cta")).toHaveAttribute("href", /\/discover/);
    await expect(visibleTestId(page, "home-hero-plan-cta")).toHaveAttribute("href", /\/plan/);
    await expect(visibleTestId(page, "home-hero-airport-cta")).toHaveAttribute("href", /\/airport/);

    await gotoStable(page, "/airport");
    await expect(visibleTestId(page, "airport-hero-plan48-cta")).toHaveAttribute(
      "href",
      /\/plan\?template=short-stay/
    );
    await expect(visibleTestId(page, "airport-footer-plan48-cta")).toHaveAttribute(
      "href",
      /\/plan\?template=short-stay/
    );
    await expect(visibleTestId(page, "airport-footer-planweek-cta")).toHaveAttribute(
      "href",
      /\/plan\?template=classic-7/
    );
    await expect(visibleTestId(page, "airport-footer-discover-cta")).toHaveAttribute(
      "href",
      /\/discover/
    );
    await expect(visibleTestId(page, "airport-footer-weather-cta")).toHaveAttribute("href", /\/weather/);
  });
});
