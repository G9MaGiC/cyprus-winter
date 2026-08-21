# Photography guidelines — Cyprus Winter

Partner and editorial art direction for place imagery. Complements [`docs/WINERY_IMAGE_INTAKE.md`](./WINERY_IMAGE_INTAKE.md).

## Goals

- **Trust:** Booking and detail pages must show the actual venue or trail context where possible.
- **Winter fit:** Golden-hour stone, villages, Troodos light — not summer beach stock.
- **Consistency:** One visual grade across partner uploads and editorial picks.

## Technical

| Rule | Value |
|------|-------|
| Aspect ratio | **4:3** for card/hero crops (matches `CARD.media`) |
| Min width | 1200px for hero sources |
| Format | JPEG or WebP; sRGB |
| File location | `public/images/cyprus/` or partner CDN via intake workflow |

## Content

**Do**

- Tasting room, courtyard, or vineyard rows in winter light
- Trail trailhead, stone villages, monastery exteriors
- Cyprus-specific geography (recognizable region)

**Don't**

- Generic Mediterranean beach/sunbed stock for wineries
- Heavy HDR or cold blue grading
- Logos/watermarks in hero crop
- Invent or scrape images (see AGENTS.md constraints)

## Partner workflow

1. Outreach queue: `docs/WINERY_IMAGE_INTAKE.md`
2. Press kit or owner-approved photo only
3. Record attribution in data when CC/licensed
4. Re-run visual QA on `/book/winery/[id]` and `/discover/[id]`

## Grade reference (lightroom-style intent)

- Slightly warm shadows (+5 warmth)
- Soft contrast — avoid crushed blacks on stone
- Skin and stone tones natural, not oversaturated terracotta

Until partner photos land, regional fallbacks in `src/lib/cyprus-images.ts` are acceptable; SCORECARD tracks ~55 venues still generic.
