#!/usr/bin/env node
/**
 * Deep-merge chrome translations into messages/{fr,he,ro}.json
 * Source: scripts/i18n/chrome-locale-overrides.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const overrides = JSON.parse(
  readFileSync(join(root, "scripts/i18n/chrome-locale-overrides.json"), "utf8"),
);

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(target, source) {
  const out = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value) && isPlainObject(out[key])) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

for (const locale of Object.keys(overrides)) {
  const path = join(root, "messages", `${locale}.json`);
  const current = JSON.parse(readFileSync(path, "utf8"));
  const next = deepMerge(current, overrides[locale]);
  writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`patched ${locale}`);
}
