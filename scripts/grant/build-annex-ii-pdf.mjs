/**
 * Build Annex II PDF from captured wireframe PNGs + captions.
 *
 * Embeds PNGs as data URLs. Playwright `setContent` uses about:blank, which
 * cannot load file:// images, so file URLs time out with naturalWidth === 0.
 *
 * Usage: node scripts/grant/build-annex-ii-pdf.mjs
 */
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const here = dirname(fileURLToPath(import.meta.url));
const grantDir = join(here, "../../docs/grant");
const framesDir = join(grantDir, "wireframes");
const outPdf = join(grantDir, "ANNEX_II.pdf");

const screens = [
  { name: "home", title: "Home", why: "Winter-first positioning, not a DMO clone" },
  {
    name: "discover",
    title: "Discover",
    why: "Intelligence + practical filters; listing cards with photos",
  },
  { name: "discover-cycling", title: "Discover · Cycling", why: "Special-interest filter (DMT cycling) with place cards" },
  { name: "discover-accessible", title: "Discover · Accessible", why: "DMT accessibility filter with listing cards" },
  { name: "discover-family", title: "Discover · Family", why: "Family winter days filter with listing cards" },
  { name: "plan", title: "Plan", why: "Funnel + sustainability strip (no fake carbon)" },
  { name: "book-winery", title: "Book tasting", why: "SME booking request (/book/winery/tsiakkas)" },
  { name: "ask-ai", title: "Ask AI overlay", why: "Grounded Cyprus Guide, not a generic chatbot" },
  { name: "bookings", title: "My Bookings", why: "Return loop — do not screenshot tokens" },
  { name: "cycling", title: "Cycling hub", why: "Special-interest sports product" },
  { name: "wine-route", title: "Krasochoria wine route", why: "Operational hours + Book tasting" },
  { name: "partner", title: "Partner portal sign-in", why: "SME hours / accept-decline (no secrets)" },
];

async function pngDataUrl(file) {
  const path = join(framesDir, file);
  await access(path, constants.R_OK);
  const buf = await readFile(path);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const sections = [];
for (const screen of screens) {
  const deskFile = `${screen.name}-1280.png`;
  const mobileFile = `${screen.name}-390.png`;
  const desk = await pngDataUrl(deskFile);
  const mobile = await pngDataUrl(mobileFile);
  sections.push(`
      <section class="screen">
        <h2>${screen.title}</h2>
        <p class="why">${screen.why}</p>
        <figure>
          <img src="${desk}" alt="${screen.title} desktop 1280" />
          <figcaption>Desktop 1280</figcaption>
        </figure>
        <figure>
          <img src="${mobile}" alt="${screen.title} mobile 390" />
          <figcaption>Mobile 390</figcaption>
        </figure>
      </section>`);
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Cyprus Winter — Annex II wireframes</title>
  <style>
    @page { size: A4; margin: 14mm; }
    body { font-family: Georgia, "Times New Roman", serif; color: #252730; }
    h1 { font-size: 22pt; margin: 0 0 8px; }
    .lede { font-size: 11pt; line-height: 1.4; max-width: 40em; }
    .meta { font-size: 9pt; color: #6b7280; margin: 12px 0 28px; }
    .screen { break-inside: avoid; page-break-inside: avoid; margin: 0 0 28px; }
    h2 { font-size: 14pt; margin: 0 0 4px; }
    .why { font-size: 10pt; margin: 0 0 10px; color: #4a5162; }
    figure { margin: 0 0 12px; }
    img { width: 100%; height: auto; border: 1px solid #eae6df; }
    figcaption { font-size: 8pt; color: #6b7280; margin-top: 4px; }
  </style>
</head>
<body>
  <h1>Cyprus Winter — Annex II</h1>
  <p class="lede">Product / service wireframes of the <strong>live prototype</strong> (screenshots labelled as wireframes of current structure). PRE-SEED/0526 ICT annex. Not a Visit Cyprus clone.</p>
  <p class="meta">Call PRE-SEED/0526 · Status: draft working pack, <strong>not submitted</strong> · Recapture: <code>npm run grant:wireframes</code> then <code>npm run grant:annex-pdf</code> · Do not include admin secrets, guest PII, or health bearer dumps.</p>
  ${sections.join("\n")}
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.waitForFunction(
  () => [...document.images].every((img) => img.complete && img.naturalWidth > 0),
  { timeout: 60_000 },
);
await page.pdf({
  path: outPdf,
  format: "A4",
  printBackground: true,
});
await browser.close();

const stat = await readFile(outPdf);
console.log(`Wrote ${outPdf} (${stat.byteLength} bytes)`);
