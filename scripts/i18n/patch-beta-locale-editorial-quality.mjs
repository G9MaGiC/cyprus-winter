/**
 * Beta editorial quality pass (he/fr/ro): broken Hebrew, Plan תוכנית, FR/RO voice polish.
 * Run: node scripts/i18n/patch-beta-locale-editorial-quality.mjs
 */
import * as fs from "node:fs";
import * as path from "node:path";

const MESSAGES_DIR = path.join(import.meta.dirname, "../../messages");
const OVERRIDES = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "beta-locale-editorial-quality-overrides.json"), "utf8")
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
  // Product Plan term: normalize defective spelling תכנית → תוכנית (he only)
  if (locale === "he") {
    function walk(obj) {
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string" && v.includes("תכנית")) {
          obj[k] = v.replaceAll("תכנית", "תוכנית");
        } else if (v && typeof v === "object" && !Array.isArray(v)) walk(v);
      }
    }
    walk(data);
  }
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`patched ${locale}.json (${Object.keys(OVERRIDES[locale]).length} keys)`);
}
