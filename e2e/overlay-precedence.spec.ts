import { test, expect } from "@playwright/test";

test("First visit: onboarding appears on discover", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("cyprus-winter-onboarded");
    localStorage.removeItem("cyprus-winter-intent");
    localStorage.setItem("cyprus-winter:cookie-consent", "all");
  });

  await page.goto("/discover");
  await expect(page.locator('[role="dialog"][aria-labelledby="onboarding-title"]')).toBeVisible({
    timeout: 15000,
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
  const cookie = page.locator('[aria-label="Cookie consent"]');
  await expect(onboarding).toBeVisible({ timeout: 15000 });
  await expect(cookie).toBeVisible({ timeout: 15000 });

  const blockedTrigger = page.getByRole("button", { name: "Finish onboarding or cookie choices first" });
  await expect(blockedTrigger).toBeDisabled();
  await blockedTrigger.click({ force: true });
  await expect(page.locator('[role="dialog"][aria-label="Cyprus Winter guide"]')).toHaveCount(0);

  await page.getByRole("button", { name: "Skip onboarding" }).click();
  await page.getByRole("button", { name: "Accept" }).click();

  const activeTrigger = page.getByRole("button", { name: "Ask your guide" });
  await expect(activeTrigger).toBeEnabled();
  await activeTrigger.click();
  await expect(page.locator('[role="dialog"][aria-label="Cyprus Winter guide"]')).toBeVisible();
});
