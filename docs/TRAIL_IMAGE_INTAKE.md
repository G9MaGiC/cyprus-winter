# Trail image intake — Visit Cyprus official heroes

Workflow for replacing generic regional trail stock with **official Visit Cyprus / Forestry Department** hero photos.

**Source:** [visitcyprus.com](https://www.visitcyprus.com/discover-cyprus/nature/nature-trails-2/) nature trail pages (Cyprus Tourism Organisation promotional assets).

**Code path:** `getTrailImage()` in `src/lib/cyprus-images.ts` (TrailCard, `/trails/[id]`, plan share OG, home editors' picks).

---

## Coverage (August 2026)

| Tier | Count | Image source |
|------|-------|--------------|
| **Official** | 29 / 71 | `public/images/cyprus/trails/trail-{id}.jpg` from Visit Cyprus |
| **Regional stock** | ~24 | Troodos / coastal / gorge / waterfall shared assets |
| **Fallback** | ~17 | Troodos default (unmapped discovery trails) |

Re-run metrics: `npm run images:validate` → `trail-image-intake.test.ts`.

---

## Refresh official photos

```bash
npm run trails:fetch-images
```

Writes:

- `public/images/cyprus/trails/trail-{id}.jpg` — mapped app trails
- `public/images/cyprus/trails/vc-{slug}.jpg` — Visit Cyprus pages not yet in catalog
- `scripts/trails/visitcyprus-manifest.json` — slug, URL, title, attribution metadata

Slug → trail id map: `scripts/trails/visitcyprus-slug-map.ts`.

---

## Adding a new official trail

1. Add trail to `src/data/trails.ts`
2. Add slug mapping in `scripts/trails/visitcyprus-slug-map.ts`
3. Run `npm run trails:fetch-images`
4. Add entry to `officialTrailImages` in `src/lib/cyprus-images.ts` (or re-run fetch and sync from manifest)
5. `npm run images:validate`

---

## Attribution

Images sourced from Visit Cyprus official tourism pages. Do not claim ownership. CTO/Forestry trail flyers remain authoritative for route stats; images are for discoverability only.

---

## Related

- `docs/WINERY_IMAGE_INTAKE.md` — partner winery hero workflow
- `docs/QA_BUGS.md` — BUG-258 trail image intake
- `scripts/trails/visitcyprus-manifest.json` — last fetch snapshot
