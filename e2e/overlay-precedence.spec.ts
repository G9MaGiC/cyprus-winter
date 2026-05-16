import { test, expect } from "@playwright/test";

test("First visit: onboarding appears on discover", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("cyprus-winter-onboarded");
    localStorage.removeItem("cyprus-winter-intent");
    localStorage.setItem("cyprus-winter:cookie-consent", "all");
  });

  await page.goto("/discover");
  // Onboarding chunk loads after `window` "load" + dynamic import + 2s intro delay (`OnboardingModal`); cold Turbopack can exceed 15s.
  await expect(page.locator('[role="dialog"][aria-labelledby="onboarding-title"]')).toBeVisible({
    timeout: 45_000,
  });
});

test("AI trigger is blocked until onboarding/cookie are resolved", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("cyprus-winter-onboarded");
    localStorage.removeItem("cyprus-winter-intent");
    localStorage.removeItem("cyprus-winter:cookie-consent");
    sessionStorage.removeItem("cyprus-ai-chat-session");
  });

  await page.goto("/");

  const onboarding = page.locator('[role="dialog"][aria-labelledby="onboarding-title"]');
  // CookieConsentBanner: role=dialog + aria-labelledby (accessible name is not always matched by getByRole)
  const cookie = page.locator('[role="dialog"][aria-labelledby="cookie-banner-title"]');
  await expect(onboarding).toBeVisible({ timeout: 25_000 });
  await expect(cookie).toBeVisible({ timeout: 25_000 });

  const blockedTrigger = page.getByRole("button", { name: "Finish onboarding or cookie choices first" });
  await expect(blockedTrigger).toBeDisabled();
  await blockedTrigger.click({ force: true });
  // AI panel uses aria-labelledby → accessible name from `common.ai.title` (e.g. "Cyprus Guide")
  await expect(page.getByRole("dialog", { name: /Cyprus Guide/i })).toHaveCount(0);

  await page.getByRole("button", { name: "Skip onboarding" }).click();
  await page.getByRole("button", { name: "Accept" }).click();

  // Nav and hero both use `nav.askAIAria`; hero visible text is "Ask your guide", nav is "Ask AI".
  const activeTrigger = page
    .getByRole("button", { name: /Ask AI for trails/i })
    .filter({ hasText: /^Ask AI$/ });
  await expect(activeTrigger).toBeEnabled({ timeout: 15_000 });
  await activeTrigger.click();
  await expect(page.getByRole("dialog", { name: /Cyprus Guide/i })).toBeVisible();
});
