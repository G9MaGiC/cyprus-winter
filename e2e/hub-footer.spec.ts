import { test, expect } from "@playwright/test";

const AI_DIALOG = '[role="dialog"][aria-labelledby="ai-chat-title"]';

test.describe("Hub footer Ask AI", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("cyprus-winter-onboarded", "true");
      localStorage.setItem("cyprus-winter:cookie-consent", "all");
    });
  });

  async function openCyprusGuideFromHub(page: import("@playwright/test").Page, path: string) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("main")).toBeVisible();

    const hubFooter = page.locator("footer").filter({
      has: page.getByRole("button", { name: /ask ai/i }),
    });
    await hubFooter.first().scrollIntoViewIfNeeded();
    const askButton = hubFooter.first().getByRole("button", { name: /ask ai/i });
    await expect(askButton).toBeVisible({ timeout: 15_000 });
    await expect(askButton).toBeEnabled({ timeout: 15_000 });

    await expect(async () => {
      await askButton.click();
      await expect(page.locator(AI_DIALOG)).toBeVisible({ timeout: 8_000 });
    }).toPass({ timeout: 45_000 });
  }

  test("events footer Ask AI opens Cyprus Guide dialog", async ({ page }) => {
    await openCyprusGuideFromHub(page, "/events");
  });

  test("airport footer Ask AI opens Cyprus Guide dialog", async ({ page }) => {
    await openCyprusGuideFromHub(page, "/airport");
  });

  test("beaches footer Ask AI opens Cyprus Guide dialog", async ({ page }) => {
    await openCyprusGuideFromHub(page, "/beaches");
  });
});
