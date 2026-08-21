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
| **Official VC heroes** | 31 | Unchanged — fd56 trails use regional stock |

App total trails: **100** (73 state-forest/discovery + 27 fd56 outside-forest additions).

---

## Commands

```bash
# Scrape fd56 HTML + leaflet PDF indexes → manifest
npm run trails:scrape-forestry

# Compare manifest to src/data/trails.ts
npm run trails:forestry-gap
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

## Leaflet PDFs (hero images — future)

The scraper records PDF flyer URLs from Troodos and Paphos index pages. PDF first-page extraction (`pdftoppm`) is deferred; fd56 trails currently use regional stock images.

Combined map PDF (~158 MB): linked in manifest under `leaflets[district=Combined map]`.

---

## Attribution

Route stats and POI copy sourced from Cyprus Department of Forests fd56 listing. Images are regional stock unless extracted from official flyers.

---

## Related

- `docs/TRAIL_IMAGE_INTAKE.md` — Visit Cyprus official heroes
- `docs/QA_BUGS.md` — BUG-260 Forestry outside-forest intake
- `scripts/trails/forestry-outside-manifest.json` — last scrape snapshot
