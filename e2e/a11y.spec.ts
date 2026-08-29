import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

/**
 * WCAG 2.2 AA sweep (P3-06 / BUG-351). Run: npm run test:a11y
 *
 * Full hard gate: structural rules (aria, landmarks, labels, names, focus
 * order, forms) AND color-contrast. The AA palette landed with BUG-351
 * (terracotta #B55738, sage #5B7967, muted-ink #666B78 replacing the
 * text-olive opacity ladder); decorative aria-hidden glyphs may stay
 * faint, but visible text must use AA tokens.
 */

const CONTRAST_IS_FATAL = true;

const PAGES = [
  "/",
  "/discover",
  "/discover/nissi-beach",
  "/trails",
  "/trails/artemis",
  "/plan",
  "/book/winery",
  "/book/winery/tsiakkas",
  "/bookings",
  "/events",
  "/he",
];

test.describe("accessibility — WCAG 2.2 AA", () => {
  test.setTimeout(300_000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("cyprus-winter-onboarded", "true");
      localStorage.setItem("cyprus-winter:cookie-consent", "essential");
    });
  });

  test("structural rules pass on every page; contrast reported", async ({ page }) => {
    const structural: string[] = [];
    const contrast: string[] = [];
    for (const path of PAGES) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(2500);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      for (const v of results.violations) {
        const line = `${path}: ${v.id} [${v.impact}] ×${v.nodes.length} — ${v.help}`;
        (v.id === "color-contrast" ? contrast : structural).push(line);
      }
    }
    if (contrast.length > 0) {
      console.warn(`[a11y] contrast findings (BUG-351, advisory):\n  ${contrast.join("\n  ")}`);
      if (CONTRAST_IS_FATAL) expect(contrast, contrast.join("\n")).toEqual([]);
    }
    expect(structural, structural.join("\n")).toEqual([]);
  });
});
