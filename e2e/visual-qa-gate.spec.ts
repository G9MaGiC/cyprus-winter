import { test, expect } from "@playwright/test";
import {
  VIEWPORT_MOBILE,
  VIEWPORT_TABLET,
  expectNoHorizontalOverflow,
  expectRtlDocument,
  gotoAndSettle,
  seedVisualQaSession,
  setViewport,
} from "./helpers/visual-qa";

/**
 * Phase E — automated visual QA gate at 375px, 768px, and Hebrew RTL.
 * Guards layout overflow and critical funnel visibility after design sprint changes.
 */
test.describe("Visual QA gate", () => {
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    await seedVisualQaSession(page);
  });

  test.describe("@375px LTR", () => {
    test.beforeEach(async ({ page }) => {
      await setViewport(page, VIEWPORT_MOBILE);
    });

    const routes: { path: string; assert: (page: import("@playwright/test").Page) => Promise<void> }[] = [
      {
        path: "/",
        assert: async (page) => {
          await expect(page.getByTestId("home-hero-explore-cta")).toBeVisible({ timeout: 15_000 });
          await expect(page.getByRole("combobox").first()).toBeVisible();
        },
      },
      {
        path: "/discover",
        assert: async (page) => {
          await expect(page.getByRole("main").getByRole("link").first()).toBeVisible({
            timeout: 15_000,
          });
        },
      },
      {
        path: "/plan",
        assert: async (page) => {
          await expect(page.getByRole("main")).toContainText(/Day 1|plan/i);
        },
      },
      {
        path: "/trails",
        assert: async (page) => {
          await expect(page.getByRole("main").getByRole("link").first()).toBeVisible({
            timeout: 15_000,
          });
        },
      },
      {
        path: "/book/winery",
        assert: async (page) => {
          await expect(page.getByRole("main").getByRole("link").first()).toBeVisible({
            timeout: 15_000,
          });
        },
      },
      {
        path: "/search",
        assert: async (page) => {
          await expect(page.getByRole("combobox").first()).toBeVisible();
        },
      },
    ];

    for (const { path, assert } of routes) {
      test(`${path} — no overflow, key content visible`, async ({ page }) => {
        await gotoAndSettle(page, path);
        await assert(page);
        await expectNoHorizontalOverflow(page);
      });
    }

    test("bottom nav visible and plan link tappable", async ({ page }) => {
      await gotoAndSettle(page, "/discover");
      const bottomNav = page.getByRole("navigation", { name: /bottom navigation/i });
      await expect(bottomNav).toBeVisible();
      const planLink = bottomNav.getByRole("link", { name: /^plan$/i });
      await expect(planLink).toBeVisible();
      const box = await planLink.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });

    test("/book/winery/tsiakkas — hero image loads (photography trust)", async ({ page }) => {
      await gotoAndSettle(page, "/book/winery/tsiakkas");
      const hero = page.locator("main img").first();
      await expect(hero).toBeVisible({ timeout: 15_000 });
      await expect(async () => {
        const width = await hero.evaluate((img: HTMLImageElement) => img.naturalWidth);
        expect(width).toBeGreaterThan(0);
      }).toPass({ timeout: 10_000 });
    });

    test("/discover/tsiakkas — card hero image loads", async ({ page }) => {
      await gotoAndSettle(page, "/discover/tsiakkas");
      const hero = page.locator("main img").first();
      await expect(hero).toBeVisible({ timeout: 15_000 });
      await expect(async () => {
        const width = await hero.evaluate((img: HTMLImageElement) => img.naturalWidth);
        expect(width).toBeGreaterThan(0);
      }).toPass({ timeout: 10_000 });
    });
  });

  test.describe("@768px LTR", () => {
    test.beforeEach(async ({ page }) => {
      await setViewport(page, VIEWPORT_TABLET);
    });

    for (const path of ["/", "/discover", "/plan"] as const) {
      test(`${path} — no overflow, main usable`, async ({ page }) => {
        await gotoAndSettle(page, path);
        await expectNoHorizontalOverflow(page);
        const bottomNav = page.getByRole("navigation", { name: /bottom navigation/i });
        await expect(bottomNav).not.toBeVisible();
      });
    }
  });

  test.describe("@375px Hebrew RTL", () => {
    test.beforeEach(async ({ page }) => {
      await setViewport(page, VIEWPORT_MOBILE);
    });

    const rtlRoutes: {
      path: string;
      navName: string | RegExp;
      linkName: string | RegExp;
      menuButton?: string | RegExp;
    }[] = [
      {
        path: "/he",
        navName: "ניווט ראשי",
        linkName: "גילוי",
        menuButton: "פתחו תפריט",
      },
      {
        path: "/he/discover",
        navName: "ניווט ראשי",
        linkName: "גילוי",
        menuButton: "פתחו תפריט",
      },
      {
        path: "/he/plan",
        navName: "ניווט ראשי",
        linkName: "גילוי",
        menuButton: "פתחו תפריט",
      },
      {
        path: "/he/book/winery",
        navName: "ניווט ראשי",
        linkName: "גילוי",
        menuButton: "פתחו תפריט",
      },
    ];

    for (const { path, navName, linkName, menuButton } of rtlRoutes) {
      test(`${path} — RTL, no overflow, nav localized`, async ({ page }) => {
        await gotoAndSettle(page, path);
        await expectRtlDocument(page);
        await expectNoHorizontalOverflow(page);

        const nav = page.getByRole("navigation", { name: navName });
        if (menuButton) {
          await nav.getByRole("button", { name: menuButton }).click();
        }
        await expect(nav.getByRole("link", { name: linkName })).toBeVisible();
      });
    }

    test("/he/discover filter chips visible without overflow", async ({ page }) => {
      await gotoAndSettle(page, "/he/discover");
      await expectRtlDocument(page);

      const toggle = page.locator("#discover-filters-toggle");
      if (await toggle.isVisible()) {
        await toggle.click();
      }
      const filters = page.getByRole("group", { name: "סינון לפי סוג מקום" });
      await expect(filters).toBeVisible({ timeout: 15_000 });
      await expect(filters.getByRole("link").first()).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  });
});
