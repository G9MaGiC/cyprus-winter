/**
 * Ensure scripts/i18n/editorial-{fr,he,ro,de,el,pl}.json matches messages/{locale}.json
 * for all mapped keys (post-chrome source of truth is messages).
 *
 * Run: npm run i18n:editorial-drift
 */
import * as fs from "node:fs";
import * as path from "node:path";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");
const MESSAGES_DIR = path.join(PROJECT_ROOT, "messages");
// Tier-1 (de/el/pl) added with the AUD-10 pilot — the 19.2 project's
// drift-gate half (docs/ICPS.md §6.1 action item).
const EDITORIAL_LOCALES = ["fr", "he", "ro", "de", "el", "pl"] as const;

function flattenStrings(
  obj: Record<string, unknown>,
  prefix = "",
  out: Record<string, string> = {}
): Record<string, string> {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      flattenStrings(v as Record<string, unknown>, key, out);
      continue;
    }
    if (typeof v === "string") out[key] = v;
  }
  return out;
}

let failed = false;

for (const locale of EDITORIAL_LOCALES) {
  const editorialPath = path.join(PROJECT_ROOT, "scripts/i18n", `editorial-${locale}.json`);
  const messagesPath = path.join(MESSAGES_DIR, `${locale}.json`);

  const editorial = JSON.parse(fs.readFileSync(editorialPath, "utf8")) as Record<string, string>;
  const messages = flattenStrings(
    JSON.parse(fs.readFileSync(messagesPath, "utf8")) as Record<string, unknown>
  );

  const drift: string[] = [];
  for (const [key, value] of Object.entries(editorial)) {
    if (typeof value !== "string") continue;
    const current = messages[key];
    if (current === undefined) {
      drift.push(`${key} (missing in messages/${locale}.json)`);
      continue;
    }
    if (current !== value) drift.push(key);
  }

  if (drift.length > 0) {
    failed = true;
    console.error(`editorial drift (${locale}): ${drift.length} key(s)`);
    for (const key of drift.slice(0, 20)) {
      console.error(`  - ${key}`);
      if (!key.includes("missing")) {
        console.error(`    editorial: ${JSON.stringify(editorial[key])}`);
        console.error(`    messages:  ${JSON.stringify(messages[key])}`);
      }
    }
    if (drift.length > 20) console.error(`  ... and ${drift.length - 20} more`);
  } else {
    console.log(`editorial-${locale}.json: OK (${Object.keys(editorial).length} keys)`);
  }
}

if (failed) {
  console.error("\nSync editorial maps: node scripts/i18n/check-editorial-drift.ts (see docs/BETA_LOCALE_EN_HOLDOUTS.md)");
  process.exit(1);
}

console.log("editorial drift check passed.");
