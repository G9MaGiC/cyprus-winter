#!/usr/bin/env node

/**
 * Bundle size budget checker for CI.
 *
 * Reads the Next.js build manifest and sums JS assets per entry point.
 * Fails if any page's first-load JS exceeds the budget.
 *
 * Usage: node scripts/check-bundle-size.mjs [--budget <KB>]
 *   Default budget: 350 KB per page (first-load JS).
 */

import fs from "fs";
import path from "path";

const BUDGET_KB = (() => {
  const idx = process.argv.indexOf("--budget");
  return idx !== -1 ? Number(process.argv[idx + 1]) : 350;
})();

const BUILD_DIR = path.resolve(".next");
const MANIFEST_PATH = path.join(BUILD_DIR, "build-manifest.json");

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error("No build manifest found at", MANIFEST_PATH);
  console.error("Run `npm run build` first.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
const staticDir = path.join(BUILD_DIR, "static");

function getFileSize(relPath) {
  // relPath looks like "_next/static/chunks/xxx.js"
  const absPath = path.join(BUILD_DIR, "..", relPath);
  try {
    return fs.statSync(absPath).size;
  } catch {
    return 0;
  }
}

// Shared chunks loaded on every page
const sharedFiles = [
  ...(manifest.pages?.["/_app"] ?? []),
  ...(manifest.rootMainFiles ?? []),
];
const sharedBytes = sharedFiles.reduce((sum, f) => sum + getFileSize(f), 0);
const sharedKB = sharedBytes / 1024;

console.log(`Shared JS (framework + app): ${Math.round(sharedKB)} KB`);
console.log(`Per-page budget: ${BUDGET_KB} KB (first-load JS)\n`);

let failed = false;
const results = [];

for (const [route, files] of Object.entries(manifest.pages ?? {})) {
  if (route === "/_app") continue;
  const pageBytes = files.reduce((sum, f) => sum + getFileSize(f), 0);
  const firstLoadKB = (sharedBytes + pageBytes) / 1024;
  const overBudget = firstLoadKB > BUDGET_KB;
  if (overBudget) failed = true;
  results.push({ route, firstLoadKB: Math.round(firstLoadKB), overBudget });
}

// Sort by size descending
results.sort((a, b) => b.firstLoadKB - a.firstLoadKB);

// Print top routes and any over budget
const toShow = results.filter((r) => r.overBudget || results.indexOf(r) < 10);
for (const r of toShow) {
  const flag = r.overBudget ? " ← OVER BUDGET" : "";
  console.log(`  ${r.route}: ${r.firstLoadKB} KB${flag}`);
}

if (results.length > toShow.length) {
  console.log(`  ... and ${results.length - toShow.length} more routes within budget`);
}

console.log();
if (failed) {
  console.error(`FAIL: One or more pages exceed the ${BUDGET_KB} KB first-load JS budget.`);
  console.error("Consider code-splitting, lazy loading, or reducing dependencies.");
  process.exit(1);
} else {
  console.log(`OK: All ${results.length} pages within ${BUDGET_KB} KB budget.`);
}
