#!/usr/bin/env node
/**
 * Native-review handoff export.
 *
 * Every non-EN string added or changed since the audit baseline (main@ca827e6,
 * PR #225 — pinned below, NOT the rolling merge-base: a merge-base-scoped diff
 * silently dropped 19 still-unreviewed keys when the branch restarted from a
 * merged PR) is pending native review (the audit's ◇ flag). This script
 * extracts exactly those strings into per-locale CSV sheets a native speaker
 * can open in any spreadsheet app — no repo tooling required — plus a README
 * with per-locale register guidance.
 *
 * A row is exported when the translation changed on the branch ("new"/
 * "edited") — or when the EN SOURCE changed while the translation did not
 * ("source-changed"): those are exactly the strings most likely to be stale,
 * so hiding them would defeat the sheet's purpose. `en_was` carries the old
 * EN wherever it differs.
 *
 * Usage:
 *   npm run i18n:export-review              writes docs/i18n-review/
 *   npm run i18n:export-review -- --check   verifies the committed sheets are
 *                                           current (no writes; exit 1 when
 *                                           stale). The pinned baseline gives
 *                                           the check a diff basis everywhere,
 *                                           main after merge included.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "docs/i18n-review");
const LOCALES = ["de", "el", "pl", "fr", "he", "ro"];
const CHECK = process.argv.includes("--check");

function flatten(obj, prefix = "", into = new Map()) {
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object") flatten(value, `${prefix}${key}.`, into);
    else into.set(`${prefix}${key}`, String(value));
  }
  return into;
}

function readCatalog(locale) {
  return flatten(JSON.parse(readFileSync(join(ROOT, `messages/${locale}.json`), "utf8")));
}

const git = (...args) =>
  execFileSync("git", args, { cwd: ROOT, maxBuffer: 1e8, encoding: "utf8" }).trim();

function readBaseCatalog(base, locale) {
  return flatten(JSON.parse(git("show", `${base}:messages/${locale}.json`)));
}

// Quote every field; double internal quotes (RFC 4180).
const csvField = (v) => `"${v.replace(/"/g, '""')}"`;
const csvRow = (cells) => cells.map(csvField).join(",");

// The audit's fixed baseline: main@ca827e6 (PR #225), the commit the persona
// audit measured. Everything shipped since is ◇ until a native speaker signs
// it off, however many merges and branch restarts happen in between.
const AUDIT_BASELINE = "ca827e6";
const base = git("rev-parse", `${AUDIT_BASELINE}^{commit}`);

const en = readCatalog("en");
const baseEn = readBaseCatalog(base, "en");
const counts = {};
let stale = false;

if (!CHECK) mkdirSync(OUT, { recursive: true });

function verify(file, content) {
  const committed = existsSync(file) ? readFileSync(file, "utf8") : null;
  if (committed !== content) {
    stale = true;
    console.error(`STALE: ${file} does not match the current catalogs — run npm run i18n:export-review`);
  }
}

for (const locale of LOCALES) {
  const branch = readCatalog(locale);
  const before = readBaseCatalog(base, locale);
  const rows = [];
  for (const [key, value] of branch) {
    const prev = before.get(key);
    const source = en.get(key);
    const prevSource = baseEn.get(key);
    const translationChanged = prev !== value;
    const sourceChanged = prevSource !== undefined && prevSource !== source;
    if (!translationChanged && !sourceChanged) continue;
    const status = prev === undefined ? "new" : translationChanged ? "edited" : "source-changed";
    if (source === undefined) {
      throw new Error(`${locale}: ${key} has no EN source — catalog parity broken`);
    }
    rows.push([key, status, sourceChanged ? prevSource : "", source, value]);
  }
  rows.sort((a, b) => a[0].localeCompare(b[0]));
  counts[locale] = {
    total: rows.length,
    added: rows.filter((r) => r[1] === "new").length,
    edited: rows.filter((r) => r[1] === "edited").length,
    sourceChanged: rows.filter((r) => r[1] === "source-changed").length,
  };
  // BOM so Excel detects UTF-8 (Greek/Hebrew otherwise mangle on open).
  const csv =
    "﻿" +
    csvRow(["key", "status", "en_was", "en", "translation"]) +
    "\n" +
    rows.map(csvRow).join("\n") +
    "\n";
  const file = join(OUT, `${locale}.csv`);
  if (CHECK) verify(file, csv);
  else writeFileSync(file, csv);
  console.log(
    `${locale}.csv: ${counts[locale].total} rows (${counts[locale].added} new, ${counts[locale].edited} edited, ${counts[locale].sourceChanged} source-changed)`
  );
}

const countsTable = LOCALES.map(
  (l) =>
    `| ${l} | ${counts[l].total} | ${counts[l].added} | ${counts[l].edited} | ${counts[l].sourceChanged} |`
).join("\n");

const readme = `# Native review sheets

Every non-EN string added or changed since the audit baseline
(\`main@${base.slice(0, 7)}\`, the commit
[UX_UI_PERSONA_AUDIT_2026-08-31.md](../UX_UI_PERSONA_AUDIT_2026-08-31.md)
measured — ◇ in that report) is pending review by a native speaker,
across every batch and merge since. Each CSV in this folder holds one
locale's full review surface — open it in any spreadsheet app (UTF-8 with
BOM, so Excel renders Greek/Hebrew correctly).

Columns: \`key\` (catalog path — the prefix tells you the surface:
\`data.wineries.*\`, \`data.attractions.*\`, \`data.trails.*\` are place
content, \`data.bestFor.*\` are short audience/context tags, everything else
is app UI copy), \`status\`, \`en_was\` (the previous English source, when it
changed), \`en\` (the current English source), \`translation\` (the string to
review).

Statuses: \`new\` — added on this branch; \`edited\` — translation changed on
this branch; \`source-changed\` — the ENGLISH changed but the translation did
not, so check it still matches the current \`en\` (these are the likeliest
stale rows).

| Locale | Rows | New | Edited | Source-changed |
|---|---|---|---|---|
${countsTable}

## What to check per locale

- **de** — formal *Sie* throughout; instructions in infinitive/imperative
  style; nouns capitalized (including inside the \`data.bestFor.*\` tags).
- **el** — plural imperatives for UI actions; Greek toponyms (Λεμεσός,
  Τρόοδος, Όμοδος, Κρασοχώρια…); \`data.bestFor.*\` labels are written
  case-neutral so one form works both as a chip and after «Ιδανικό για» —
  keep that property when correcting.
- **pl** — natural, non-calqued register; \`data.bestFor.*\` labels are
  nominative by design (the sentence frame was moved to a colon
  construction — "Najlepsze dopasowanie:" — precisely so tags need no case
  inflection; don't "fix" them into the genitive).
- **fr** — *vous* register; typographic apostrophe (’); French spacing
  conventions; no leading articles in the \`data.bestFor.*\` tags.
- **he** — gender-inclusive plural imperatives; LTR isolates (U+2066/U+2069)
  around clock/numeric ranges; geresh/gershayim in abbreviations (ק״מ,
  דוא״ל); \`data.bestFor.*\` labels are noun phrases so they read correctly
  after "מתאים ל…".
- **ro** — formal register; diacritics (ș/ț, not ş/ţ).

## Handing corrections back

Edit only the \`translation\` column (keep \`key\` untouched) and return the
CSV — corrections are then patched into \`messages/<locale>.json\`, the
tier-1 drift maps re-pinned, and the sheets regenerated (CI fails if they
drift from the catalogs — see below).

## Regenerating

\`npm run i18n:export-review\` rebuilds every sheet from the current
catalogs against the pinned audit baseline (\`main@${base.slice(0, 7)}\`),
so the surface survives branch restarts and merges intact. CI runs
\`npm run i18n:export-review -- --check\` so a catalog edit that isn't
reflected here fails the Quality job instead of silently staling the
sheets.
`;

const readmeFile = join(OUT, "README.md");
if (CHECK) verify(readmeFile, readme);
else writeFileSync(readmeFile, readme);

if (CHECK) {
  if (stale) process.exit(1);
  console.log(`sheets are current; base ${base.slice(0, 7)}`);
} else {
  console.log(`README.md written; base ${base.slice(0, 7)}`);
}
