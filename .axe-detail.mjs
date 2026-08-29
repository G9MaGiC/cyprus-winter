import { chromium } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

const pages = process.argv.slice(2);
const browser = await chromium.launch();
const ctx = await browser.newContext();
await ctx.addInitScript(() => {
  localStorage.setItem("cyprus-winter-onboarded", "true");
  localStorage.setItem("cyprus-winter:cookie-consent", "essential");
});
const page = await ctx.newPage();
for (const path of pages) {
  await page.goto(`http://localhost:3005${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const results = await new AxeBuilder({ page }).withTags(["wcag2aa", "wcag22aa"]).analyze();
  const v = results.violations.find((v) => v.id === "color-contrast");
  console.log(`\n===== ${path}: ${v ? v.nodes.length : 0} nodes =====`);
  if (!v) continue;
  // Group by (fg,bg,ratio) signature to collapse repeats
  const groups = new Map();
  for (const n of v.nodes) {
    const d = n.any[0]?.data ?? {};
    const key = `${d.fgColor} on ${d.bgColor} = ${d.contrastRatio} (needs ${d.expectedContrastRatio})`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(n.target.join(" "));
  }
  for (const [sig, targets] of groups) {
    console.log(`  ×${targets.length}  ${sig}`);
    for (const t of targets.slice(0, 3)) console.log(`      ${t.slice(0, 160)}`);
  }
}
await browser.close();
