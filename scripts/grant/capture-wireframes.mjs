/**
 * Capture Annex II prototype wireframes (desktop 1280 + mobile 390).
 * Usage: GRANT_BASE_URL=http://localhost:3000 node scripts/grant/capture-wireframes.mjs
 */
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "../../docs/grant/wireframes");
const base = (process.env.GRANT_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

const pages = [
  { name: "home", path: "/", wait: "Start here" },
  { name: "discover", path: "/discover", wait: /Tsiakkas|Omodos|Lefkara/i },
  { name: "discover-cycling", path: "/discover?filter=cycling", wait: /Platres|Prodromos|Akamas/i },
  { name: "plan", path: "/plan" },
  { name: "book-winery", path: "/book/winery/tsiakkas" },
  { name: "bookings", path: "/bookings" },
  { name: "cycling", path: "/cycling", wait: "Cycling in Cyprus winter" },
  { name: "wine-route", path: "/wine-routes/krasochoria", wait: "Book a tasting on this route" },
  { name: "partner", path: "/partner", wait: "Partner portal" },
];

const viewports = [
  { suffix: "1280", width: 1280, height: 800 },
  { suffix: "390", width: 390, height: 844 },
];

const AI_DIALOG = '[role="dialog"][aria-labelledby="ai-chat-title"]';

async function prep(page) {
  await page.addInitScript(() => {
    localStorage.setItem("cyprus-winter-onboarded", "true");
    localStorage.setItem("cyprus-winter:cookie-consent", "all");
  });
}

async function waitMain(page) {
  await page.locator("main").first().waitFor({ state: "visible", timeout: 60_000 });
}

async function dismissCookies(page) {
  const accept = page.getByRole("button", { name: /accept all|accept/i });
  if (await accept.isVisible({ timeout: 1500 }).catch(() => false)) {
    await accept.click();
  }
}

async function waitSettled(page) {
  await waitMain(page);
  await dismissCookies(page);
  await page.waitForFunction(() => document.querySelectorAll(".animate-pulse").length === 0, null, {
    timeout: 30_000,
  }).catch(() => {});
  await page
    .locator('[data-overlay-priority="blocking"][data-overlay-active="true"]')
    .waitFor({ state: "detached", timeout: 20_000 })
    .catch(() => {});
}

async function openAskAi(page) {
  for (let attempt = 0; attempt < 10; attempt++) {
    await page.evaluate(() => {
      document
        .querySelectorAll('[data-overlay-priority="blocking"][data-overlay-active="true"]')
        .forEach((el) => el.remove());
      window.dispatchEvent(new CustomEvent("open-ai-assistant"));
    });
    try {
      await page.locator(AI_DIALOG).waitFor({ state: "visible", timeout: 3_000 });
      return;
    } catch {
      await page.waitForTimeout(700);
    }
  }
  throw new Error("Ask AI dialog did not open after retries");
}

async function shot(page, file) {
  await page.screenshot({ path: join(outDir, file), fullPage: false });
}

const browser = await chromium.launch();
await mkdir(outDir, { recursive: true });

try {
  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await prep(page);

    for (const route of pages) {
      await page.goto(`${base}${route.path}`, { waitUntil: "domcontentloaded", timeout: 90_000 });
      await waitSettled(page);
      if (route.wait) {
        const loc = page.getByText(route.wait).first();
        await loc.waitFor({ timeout: 30_000 });
        await loc.scrollIntoViewIfNeeded();
      }
      await shot(page, `${route.name}-${vp.suffix}.png`);
    }

    await page.goto(`${base}/discover`, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await waitSettled(page);
    await openAskAi(page);
    await shot(page, `ask-ai-${vp.suffix}.png`);
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(`Wrote wireframes to ${outDir}`);
