# Visit Cyprus trail index crawler

Maintenance tooling to compare the **official Visit Cyprus nature-trail catalog** against our slug map and `src/data/trails.ts`.

## Commands

```bash
# Fetch VC index (page 1) + English post sitemaps → scripts/trails/vc-trail-index.json
npm run trails:fetch-index

# Live gap report (exit 1 if unmapped slugs or invalid trail ids)
npm run trails:vc-gap

# Gap report from last fetch snapshot
npm run trails:vc-gap -- --offline
```

## How it works

| Source | Coverage |
|--------|----------|
| [Nature trails index](https://www.visitcyprus.com/discover-cyprus/nature/nature-trails-2/) | Page 1 HTML only (~11 trails). Pagination is client-side JS (3 pages). |
| WordPress post sitemaps | Fuller English catalog under `discover-cyprus/nature/nature-trails-2/` |

The fetch script merges both sources. The gap script compares the union against `scripts/trails/visitcyprus-slug-map.ts`.

## Slug map

`scripts/trails/visitcyprus-slug-map.ts` maps long VC URL slugs → Cyprus Winter trail ids. Shared ids are expected (e.g. Madari has two VC page aliases).

Used by:

- `npm run trails:vc-gap` — maintenance
- `npm run data:validate` — offline audit via `src/lib/vc-trail-index-audit.test.ts`
- Trail image intake on branch `cursor/trail-images-visitcyprus-043e` (`npm run trails:fetch-images`)

## Adding coverage

1. Add trail to `src/data/trails.ts`
2. Add slug → id in `scripts/trails/visitcyprus-slug-map.ts`
3. Run `npm run trails:fetch-index && npm run trails:vc-gap`
4. `npm run data:validate`

## CI

`data:validate` runs `vc-trail-index-audit.test.ts` offline (no network). Run `trails:fetch-index` periodically when VC publishes new official trails.

Pending VC slugs without app trails yet (add to slug map when intake lands):

- `ezousa-walking-trail-circular-pafos-paphos-district-nature-trail` → planned `ezousa-valley`
- `panagia-tou-araka-stavros-tou-agiasmati-linear-lefkosia-nicosia-district-adelfoi-forest-nature-trail` → planned `panagia-araka-stavros`

## Related

- `docs/TRAIL_IMAGE_INTAKE.md` (trail-images branch) — hero photo workflow
- `docs/TRAIL_FORESTRY_INTAKE.md` — Forestry Department PDF gap analysis
- `docs/TRAIL_HIKING_MAP_VALIDATE.md` — 68 authoritative id validation
- `/nature` hub crosslink: `src/lib/nature-excursion-types.ts` → `visitCyprusTrails` (nature branch)
