#!/usr/bin/env node
/**
 * Tier-1 chrome polish: trail detail meta, secrets types, event month shorts.
 * Run: node scripts/i18n/patch-tier1-chrome-polish.mjs
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const overridesPath = path.join(root, "scripts/i18n/tier1-chrome-polish-overrides.json");

/** @type {Record<string, Record<string, string>>} */
const OVERRIDES = JSON.parse(fs.readFileSync(overridesPath, "utf8"));

function setPath(obj, dotted, value) {
  const parts = dotted.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

for (const [locale, map] of Object.entries(OVERRIDES)) {
  const file = path.join(root, "messages", `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const [key, value] of Object.entries(map)) {
    setPath(data, key, value);
  }
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`${locale}: wrote ${Object.keys(map).length} keys`);
}
