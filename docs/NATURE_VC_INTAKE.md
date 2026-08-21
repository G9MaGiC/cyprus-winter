# Visit Cyprus nature excursions intake

Official **Visit Cyprus “Sites of Interest”** (nature/excursions) as a curated layer on `/nature`, plus editorial crosslinks to BirdLife Cyprus, Cyprus Rocks, and VC climbing/birdwatching/trails pages.

## Commands

```bash
npm run nature:fetch-index
# → scripts/nature/vc-excursions-index.json
```

Curated records: `src/data/nature-excursions.ts` (12 official VC sites in v1 index).

## App surface

| Route | Purpose |
|-------|---------|
| `/nature` | Nature hub — VC sites + partner crosslinks |
| `/trails`, `/cycling`, `/discover?filter=climbing` | In-app curated layers |

## Crosslinks (not scraped)

| Partner | URL |
|---------|-----|
| BirdLife Cyprus | birdlifecyprus.org |
| Cyprus Rocks | cyprusrocks.eu |
| Visit Cyprus climbing | `/discover-cyprus/nature/climbing/` |
| Visit Cyprus birdwatching | `/discover-cyprus/nature/birdwatching/` |
| Visit Cyprus nature trails | `/discover-cyprus/nature/nature-trails-2/` |

## Adding sites

1. Confirm slug on [VC excursions index](https://www.visitcyprus.com/discover-cyprus/nature/excursions/)
2. Add row to `src/data/nature-excursions.ts` with winter-focused copy
3. Set `relatedTrailId` / `relatedPlaceId` when we have curated entries
4. Run `npm run nature:fetch-index` to compare slug inventory

## Verification

```bash
npm run test -- src/lib/nature-excursions.test.ts scripts/nature/fetch-vc-excursions-index.test.ts
npm run i18n:validate && npm run build
```
