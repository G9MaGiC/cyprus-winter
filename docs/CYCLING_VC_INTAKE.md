# Visit Cyprus cycling routes intake

Official **CTO / Visit Cyprus** cycling routes as a curated layer on the `/cycling` hub. Editorial activity places remain in `activity-places.ts`; this adds authoritative route cards with outbound links and GPX where published.

## Commands

```bash
# Refresh slug list from VC index pages (maintenance)
npm run cycling:fetch-index

# Writes scripts/cycling/vc-cycling-index.json
```

Curated route records live in `src/data/cycling-routes.ts` (20 winter-relevant routes, v1).

## App surface

| Route | Purpose |
|-------|---------|
| `/cycling` | Hub — curated places + **Official Visit Cyprus routes** section with region filter |

Each route card links to the official Visit Cyprus page. GPX downloads link directly to `visitcyprus.com` when published. Optional `relatedPlaceId` cross-links to our discover/activity entry.

## Sources

- Index: [Cycling Routes](https://www.visitcyprus.com/discover-cyprus/routes/cycling-routes-routes/)
- Nature hub: [Cycling](https://www.visitcyprus.com/discover-cyprus/nature/cycling/)
- Brochure: [Cycling PDF](https://www.visitcyprus.com/wp-content/uploads/2025/06/Cycling-WEB-ONLY.pdf)

Do not contradict Visit Cyprus safety or entry guidance. We link out; we do not host GPX or replicate full route maps.

## Adding routes

1. Confirm the official VC page URL and stats (distance, surface, difficulty).
2. Add a row to `src/data/cycling-routes.ts` with winter-focused copy.
3. Set `winterPick: true` for hub highlights (target 8–12).
4. Run `npm run cycling:fetch-index` periodically to compare slug coverage.

## Verification

```bash
npm run test -- src/lib/cycling-routes.test.ts scripts/cycling/fetch-vc-route-index.test.ts
npm run i18n:validate && npm run build
```
