# Authoritative trail catalog validation

Offline validation of the **68 authoritative nature-trail ids** (Visit Cyprus state-forest pages + Forestry fd56 outside-forest + PDF leaflets). Compares against `src/data/trails.ts` without downloading the Forestry mega map PDF.

## Commands

```bash
# Gap report (informational on main — 34/68 present until trail intake merges)
npm run trails:hiking-map-validate

# Exit 1 when authoritative ids are missing (use after trail-images merge)
npm run trails:hiking-map-validate -- --strict
```

## Authoritative union (68)

| Tier | Source | Count |
|------|--------|-------|
| Visit Cyprus | visitcyprus.com nature-trails-2 | 31 |
| fd56 outside | moa.gov.cy fd56_en HTML | 31 |
| Forestry PDF | Troodos + Paphos leaflet indexes | +6 unique |
| **Union** | Deduped | **68** |

Canonical list: `scripts/trails/authoritative-trail-ids.ts`

## Mega map PDF (deferred)

[Informative Leaflet — Akamas / Troodos / Kavo Gkreko](https://www.moa.gov.cy/moa/fd/fd.nsf/All/4269544DF440E9D4C22583C10026422E?OpenDocument) (~158 MB). Historical i4WALKer guidebook listed **26** routes — a subset of Visit Cyprus **31**. Automated extraction not implemented (image-heavy).

## Coverage on main (Aug 2026)

On `main`: ~**34 / 68** authoritative ids. Full **68 / 68** coverage on `cursor/trail-images-visitcyprus-043e` (105 trails total).

Run with `--strict` after trail intake merge to gate CI.

## CI

`data:validate` runs `vc-hiking-map-validate.test.ts` offline:

- 68-id list integrity
- VC slug map ⊆ authoritative union

Does **not** require all 68 in app until `--strict` is enabled post-intake.

## Related

- `docs/TRAIL_VC_INDEX_CRAWLER.md` — VC index slug maintenance
- `docs/TRAIL_STATE_FOREST_INTAKE.md` (trail-images branch) — full tier gap analysis
- `npm run trails:state-forest-gap` (trail-images branch)
