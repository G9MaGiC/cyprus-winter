# Native review sheets

Every non-EN string added or changed on the audit branch (◇ in
[UX_UI_PERSONA_AUDIT_2026-08-31.md](../UX_UI_PERSONA_AUDIT_2026-08-31.md))
is pending review by a native speaker. Each CSV in this folder holds one
locale's full review surface — open it in any spreadsheet app (UTF-8 with
BOM, so Excel renders Greek/Hebrew correctly).

Columns: `key` (catalog path — the prefix tells you the surface:
`data.wineries.*`, `data.attractions.*`, `data.trails.*` are place
content, `data.bestFor.*` are short audience/context tags, everything else
is app UI copy), `status`, `en_was` (the previous English source, when it
changed), `en` (the current English source), `translation` (the string to
review).

Statuses: `new` — added on this branch; `edited` — translation changed on
this branch; `source-changed` — the ENGLISH changed but the translation did
not, so check it still matches the current `en` (these are the likeliest
stale rows).

| Locale | Rows | New | Edited | Source-changed |
|---|---|---|---|---|
| de | 1154 | 1108 | 45 | 1 |
| el | 1175 | 1108 | 66 | 1 |
| pl | 1157 | 1108 | 48 | 1 |
| fr | 1151 | 1108 | 42 | 1 |
| he | 1208 | 1108 | 99 | 1 |
| ro | 1151 | 1108 | 41 | 2 |

## What to check per locale

- **de** — formal *Sie* throughout; instructions in infinitive/imperative
  style; nouns capitalized (including inside the `data.bestFor.*` tags).
- **el** — plural imperatives for UI actions; Greek toponyms (Λεμεσός,
  Τρόοδος, Όμοδος, Κρασοχώρια…); `data.bestFor.*` labels are written
  case-neutral so one form works both as a chip and after «Ιδανικό για» —
  keep that property when correcting.
- **pl** — natural, non-calqued register; `data.bestFor.*` labels are
  nominative by design (the sentence frame was moved to a colon
  construction — "Najlepsze dopasowanie:" — precisely so tags need no case
  inflection; don't "fix" them into the genitive).
- **fr** — *vous* register; typographic apostrophe (’); French spacing
  conventions; no leading articles in the `data.bestFor.*` tags.
- **he** — gender-inclusive plural imperatives; LTR isolates (U+2066/U+2069)
  around clock/numeric ranges; geresh/gershayim in abbreviations (ק״מ,
  דוא״ל); `data.bestFor.*` labels are noun phrases so they read correctly
  after "מתאים ל…".
- **ro** — formal register; diacritics (ș/ț, not ş/ţ).

## Handing corrections back

Edit only the `translation` column (keep `key` untouched) and return the
CSV — corrections are then patched into `messages/<locale>.json`, the
tier-1 drift maps re-pinned, and the sheets regenerated (CI fails if they
drift from the catalogs — see below).

## Regenerating

`npm run i18n:export-review` rebuilds every sheet from the current
catalogs against the branch's merge-base with `origin/main`. CI runs
`npm run i18n:export-review -- --check` so a catalog edit that isn't
reflected here fails the Quality job instead of silently staling the
sheets.
