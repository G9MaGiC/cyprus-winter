import { test, expect, type Page } from "@playwright/test";

/**
 * Arrival flow contract tests using stable test ids.
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

    const airportCta = page.getByTestId("home-hero-airport-cta");
    await expect(airportCta).toBeVisible();
    await airportCta.click({ force: true });

    await expect(page).toHaveURL(/\/airport/);
    await expect(page.getByRole("main")).toBeVisible();

    const picker = page.locator(
      '[data-testid="airport-picker-lca"], [data-testid="airport-picker-pfo"]'
    );
    await expect(picker.first()).toBeVisible();

    const planHeroCta = page.getByTestId("airport-hero-plan48-cta");
    await expect(planHeroCta).toBeVisible();
    await expect(planHeroCta).toHaveAttribute("href", /\/plan\?template=short-stay/);
    const quickPlanCta = page.getByTestId("airport-quick-plan");
    await expect(quickPlanCta).toBeVisible();
    await quickPlanCta.click({ force: true });
    await expect(page).toHaveURL(/\/plan(\?template=short-stay)?$/);
  });

  test("arrival-fallback-path: alternate airport picker branch is usable", async ({ page }) => {
    await gotoStable(page, "/airport");
    await expect(page.getByRole("main")).toBeVisible();

    const lcaPicker = page.getByTestId("airport-picker-lca");
    const pfoPicker = page.getByTestId("airport-picker-pfo");

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
      page.getByTestId("home-hero-airport-cta").click({ force: true }),
    ]);

    await page.goBack();
    await expect(page).toHaveURL(/\/($|[a-z]{2}$)/);
    await expect(page.getByTestId("home-hero-airport-cta")).toBeVisible();

    await gotoStable(page, "/airport");
    await page.reload({ waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("airport-hero-plan48-cta")).toBeVisible();
    await expect(page.getByTestId("airport-quick-weather")).toBeVisible();
    await expect(page.getByTestId("airport-quick-discover")).toBeVisible();
    await expect(page.getByTestId("airport-footer-discover-cta")).toBeVisible();
  });

  test("arrival-cta-contract: key test IDs and hrefs remain stable", async ({ page }) => {
    await gotoStable(page, "/");
    await expect(page.getByTestId("home-hero-explore-cta")).toHaveAttribute("href", /\/discover/);
    await expect(page.getByTestId("home-hero-plan-cta")).toHaveAttribute("href", /\/plan/);
    await expect(page.getByTestId("home-hero-airport-cta")).toHaveAttribute("href", /\/airport/);

    await gotoStable(page, "/airport");
    await expect(page.getByTestId("airport-hero-plan48-cta")).toHaveAttribute(
      "href",
      /\/plan\?template=short-stay/
    );
    await expect(page.getByTestId("airport-footer-plan48-cta")).toHaveAttribute(
      "href",
      /\/plan\?template=short-stay/
    );
    await expect(page.getByTestId("airport-footer-planweek-cta")).toHaveAttribute(
      "href",
      /\/plan\?template=classic-7/
    );
    await expect(page.getByTestId("airport-footer-discover-cta")).toHaveAttribute(
      "href",
      /\/discover/
    );
    await expect(page.getByTestId("airport-footer-weather-cta")).toHaveAttribute("href", /\/weather/);
  });
});

