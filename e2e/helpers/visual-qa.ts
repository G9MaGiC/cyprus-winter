import { expect, type Page } from "@playwright/test";

/** Primary mobile design target (iPhone SE class). */
export const VIEWPORT_MOBILE = { width: 375, height: 667 } as const;

/** Tablet portrait — md breakpoint boundary. */
export const VIEWPORT_TABLET = { width: 768, height: 1024 } as const;

export async function seedVisualQaSession(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("cyprus-winter-onboarded", "true");
    localStorage.setItem("cyprus-winter:cookie-consent", "all");
    localStorage.setItem("cyprus-winter-ai-pulse-seen", "true");
  });
}

export async function setViewport(
  page: Page,
  size: typeof VIEWPORT_MOBILE | typeof VIEWPORT_TABLET
) {
  await page.setViewportSize(size);
}

/** Fail when document scrolls horizontally (1px tolerance for subpixel rounding). */
export async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth > root.clientWidth + 1;
  });
  expect(hasOverflow, "page should not scroll horizontally").toBe(false);
}

export async function gotoAndSettle(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("main")).toBeVisible({ timeout: 25_000 });
  await page.waitForTimeout(300);
}

export async function expectRtlDocument(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
}
