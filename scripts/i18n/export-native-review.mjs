#!/usr/bin/env node
/**
 * Native-review handoff export.
 *
 * Every non-EN string added or changed on this branch (measured against the
 * merge-base with origin/main) is pending native review (the audit's ◇ flag).
 * This script extracts exactly those strings into per-locale CSV sheets a
 * native speaker can open in any spreadsheet app — no repo tooling required —
 * plus a README with per-locale register guidance.
 *
 * Usage: npm run i18n:export-review   (writes docs/i18n-review/)
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "docs/i18n-review");
const LOCALES = ["de", "el", "pl", "fr", "he", "ro"];

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

function readBaseCatalog(base, locale) {
  const raw = execFileSync("git", ["show", `${base}:messages/${locale}.json`], {
    cwd: ROOT,
    maxBuffer: 1e8,
    encoding: "utf8",
  });
  return flatten(JSON.parse(raw));
}

// Quote every field; double internal quotes (RFC 4180).
const csvField = (v) => `"${v.replace(/"/g, '""')}"`;
const csvRow = (cells) => cells.map(csvField).join(",");

const base = execFileSync("git", ["merge-base", "HEAD", "origin/main"], {
  cwd: ROOT,
  encoding: "utf8",
}).trim();

const en = readCatalog("en");
const counts = {};

mkdirSync(OUT, { recursive: true });

for (const locale of LOCALES) {
  const branch = readCatalog(locale);
  const before = readBaseCatalog(base, locale);
  const rows = [];
  for (const [key, value] of branch) {
    const prev = before.get(key);
    if (prev === value) continue;
    const status = prev === undefined ? "new" : "edited";
    const source = en.get(key);
    if (source === undefined) {
      throw new Error(`${locale}: ${key} has no EN source — catalog parity broken`);
    }
    rows.push([key, status, source, value]);
  }
  rows.sort((a, b) => a[0].localeCompare(b[0]));
  counts[locale] = {
    total: rows.length,
    added: rows.filter((r) => r[1] === "new").length,
    edited: rows.filter((r) => r[1] === "edited").length,
  };
  // BOM so Excel detects UTF-8 (Greek/Hebrew otherwise mangle on open).
  const csv =
    "﻿" +
    csvRow(["key", "status", "en", "translation"]) +
    "\n" +
    rows.map(csvRow).join("\n") +
    "\n";
  writeFileSync(join(OUT, `${locale}.csv`), csv);
  console.log(`${locale}.csv: ${counts[locale].total} rows (${counts[locale].added} new, ${counts[locale].edited} edited)`);
}

const countsTable = LOCALES.map(
  (l) => `| ${l} | ${counts[l].total} | ${counts[l].added} | ${counts[l].edited} |`
).join("\n");

writeFileSync(
  join(OUT, "README.md"),
  `# Native review sheets

Every non-EN string added or changed on the audit branch (◇ in
[UX_UI_PERSONA_AUDIT_2026-08-31.md](../UX_UI_PERSONA_AUDIT_2026-08-31.md))
is pending review by a native speaker. Each CSV in this folder holds one
locale's full review surface — open it in any spreadsheet app (UTF-8 with
BOM, so Excel renders Greek/Hebrew correctly).

Columns: \`key\` (catalog path — the prefix tells you the surface:
\`data.wineries.*\`, \`data.attractions.*\`, \`data.trails.*\` are place
content, \`data.bestFor.*\` are short audience/context tags, everything else
is app UI copy), \`status\` (\`new\` on this branch, or \`edited\`),
\`en\` (the English source), \`translation\` (the string to review).

| Locale | Rows | New | Edited |
|---|---|---|---|
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
CSV — corrections are then patched into \`messages/<locale>.json\` and the
tier-1 drift maps re-pinned.

## Regenerating

\`npm run i18n:export-review\` rebuilds every sheet from the current
catalogs against the branch's merge-base with \`origin/main\`.
`
);
console.log(`README.md written; base ${base.slice(0, 7)}`);
