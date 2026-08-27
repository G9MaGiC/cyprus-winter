/**
 * Chrome batch 5 i18n (fr/he/ro): discover detail, trails detail/filters/tips/conditions, events page.
 * Run: node scripts/i18n/patch-locale-chrome-batch5.mjs
 */
import * as fs from "node:fs";
import * as path from "node:path";

const MESSAGES_DIR = path.join(import.meta.dirname, "../../messages");
const OVERRIDES = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "beta-locale-chrome-batch5-overrides.json"), "utf8")
);

function setNested(obj, keyPath, value) {
  const parts = keyPath.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

for (const locale of Object.keys(OVERRIDES)) {
  const file = path.join(MESSAGES_DIR, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const [key, value] of Object.entries(OVERRIDES[locale])) {
    setNested(data, key, value);
  }
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`patched ${locale}.json (${Object.keys(OVERRIDES[locale]).length} keys)`);
}
