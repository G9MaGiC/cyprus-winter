/**
 * Beta locale soft-gap i18n (fr, he, ro): home footer, place picker, bookings page, day combos.
 * Run: node scripts/i18n/patch-beta-locale-soft-gaps.mjs
 */
import * as fs from "node:fs";
import * as path from "node:path";

const MESSAGES_DIR = path.join(import.meta.dirname, "../../messages");
const DAY_COMBOS = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "day-combos-translations.json"), "utf8")
);
const OVERRIDES = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "beta-locale-soft-gaps-overrides.json"), "utf8")
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
  let count = 0;

  for (const [key, value] of Object.entries(OVERRIDES[locale])) {
    setNested(data, key, value);
    count++;
  }

  const combos = DAY_COMBOS[locale];
  if (combos) {
    for (const [comboId, fields] of Object.entries(combos)) {
      for (const [field, value] of Object.entries(fields)) {
        setNested(data, `plan.dayCombos.${comboId}.${field}`, value);
        count++;
      }
    }
  }

  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`patched ${locale}.json (${count} keys)`);
}
