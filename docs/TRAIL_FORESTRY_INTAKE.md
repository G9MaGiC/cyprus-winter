# Trail intake — Forestry Department (outside state forests)

Workflow for importing **official Forestry Department** trail stats from moa.gov.cy fd56 (trails outside state forests) and comparing against the app catalog.

**Source:** [Nature Trails — outside state forests](https://www.moa.gov.cy/moa/fd/fd.nsf/fd56_en/fd56_en?OpenDocument) (31 routes, Aug 2026).

**Related:** Visit Cyprus heroes in `docs/TRAIL_IMAGE_INTAKE.md` (state-forest / CTO pages).

---

## Coverage (August 2026)

| Tier | Count | Notes |
|------|-------|-------|
| **fd56 catalog** | 31 | Scraped from moa.gov.cy |
| **Mapped to app ids** | 31 / 31 | `scripts/trails/forestry-name-map.ts` |
| **In app** | 31 / 31 | Includes 27 added in BUG-260 |
| **Editorial polish** | 27 / 27 | `forestry-trail-copy.ts` + `npm run trails:polish-forestry` |
| **Official VC heroes** | 31 | Unchanged — fd56 trails use regional stock |

App total trails: **100** (73 state-forest/discovery + 27 fd56 outside-forest additions).

---

## Commands

```bash
# Scrape fd56 HTML + leaflet PDF indexes → manifest
npm run trails:scrape-forestry

# Compare manifest to src/data/trails.ts
npm run trails:forestry-gap

# Verify fd56 stats match app catalog (length, duration, difficulty)
npm run trails:sync-forestry-stats

# Re-apply editorial copy after manifest refresh
npm run trails:polish-forestry

# Forestry PDF leaflets vs official/regional hero coverage
npm run trails:forestry-leaflet-gap
```

Outputs:

- `scripts/trails/forestry-outside-manifest.json` — parsed stats, POI, leaflet PDF URLs
- Gap report lists missing / unmapped trails (exit code 1 if gaps remain)

---

## Adding or updating a fd56 trail

1. Add or update mapping in `scripts/trails/forestry-name-map.ts`
2. Add trail to `src/data/trails.ts` with Forestry-aligned stats
3. Add `trailConditions` entry
4. Optional: add regional hero in `regionalTrailImages` (`src/lib/cyprus-images.ts`)
5. `npm run trails:forestry-gap` → should show 0 missing
6. `npm run data:export && npm run data:validate`
7. `npm run images:validate`

---

## Leaflet PDFs (hero images — deferred)

The scraper records PDF flyer URLs from Troodos and Paphos index pages. Automated first-page extraction was attempted (pdfjs + canvas) but Forestry four-fold flyers use JPEG2000 images that do not decode in Node without OpenJPEG/poppler. fd56 and regional trails continue to use regional stock until manual hero crop or `pdftoppm` in CI.

Combined map PDF (~158 MB): linked in manifest under `leaflets[district=Combined map]`.

---

## Stats sync (fd56 ↔ app)

Four trails existed in the app before BUG-260 and were re-aligned to fd56 stats in BUG-261: `vouni-panagias`, `millomeris-falls`, `ariadni`, `lefkara-path`.

Run `npm run trails:sync-forestry-stats` after manifest or trail edits to catch drift.

---

## Attribution

Route stats and POI copy sourced from Cyprus Department of Forests fd56 listing. Images are regional stock unless extracted from official flyers.

---

## Related

- `docs/TRAIL_IMAGE_INTAKE.md` — Visit Cyprus official heroes
- `docs/QA_BUGS.md` — BUG-260 Forestry outside-forest intake
- `scripts/trails/forestry-outside-manifest.json` — last scrape snapshot
