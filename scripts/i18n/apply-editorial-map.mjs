/**
 * Apply flat key → string maps onto locale JSON files.
 * Usage: node scripts/i18n/apply-editorial-map.mjs <he|fr|ro|de|el|pl> <map.json>
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const locale = process.argv[2];
const mapPath = process.argv[3];
if (!locale || !mapPath || !["he", "fr", "ro", "de", "el", "pl"].includes(locale)) {
  console.error("Usage: node scripts/i18n/apply-editorial-map.mjs <he|fr|ro|de|el|pl> <map.json>");
  process.exit(1);
}

const root = resolve(import.meta.dirname, "../..");
const messagesPath = resolve(root, `messages/${locale}.json`);
const messages = JSON.parse(readFileSync(messagesPath, "utf8"));
const map = JSON.parse(readFileSync(resolve(mapPath), "utf8"));

function setPath(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (cur[key] == null || typeof cur[key] !== "object") {
      throw new Error(`missing object at ${keys.slice(0, i + 1).join(".")}`);
    }
    cur = cur[key];
  }
  const last = keys[keys.length - 1];
  if (typeof cur[last] !== "string") {
    throw new Error(`target is not a string: ${path}`);
  }
  cur[last] = value;
}

let applied = 0;
for (const [path, value] of Object.entries(map)) {
  if (typeof value !== "string") {
    throw new Error(`map value for ${path} must be a string`);
  }
  setPath(messages, path, value);
  applied++;
}

writeFileSync(messagesPath, `${JSON.stringify(messages, null, 2)}\n`);
console.log(`Applied ${applied} keys to messages/${locale}.json`);
