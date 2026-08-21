# Trail intake — state forest & authoritative catalog

Gap analysis across **Visit Cyprus** (state-forest / national-park official pages), **Forestry fd56** (outside state forests), and **Forestry PDF leaflets**.

---

## Coverage (August 2026)

| Tier | Source | Count | In app |
|------|--------|-------|--------|
| **Visit Cyprus** | visitcyprus.com nature-trails-2 | 31 | 31 / 31 |
| **fd56 outside** | moa.gov.cy fd56_en HTML | 31 | 31 / 31 |
| **Forestry PDF** | Troodos + Paphos leaflet indexes | 16 mapped | 16 / 16 |
| **Authoritative union** | Deduped tiers above | **68** | **68 / 68** |
| **Discovery / editorial** | App-only routes (E4, variants, gems) | — | 37 |
| **App total** | | | **105** |

Visit Cyprus and fd56 are disjoint sets (inside vs outside state forest). PDF leaflets add routes not on fd56 HTML (e.g. Chorteri, Venetian Bridges, Troodos Visitor Centre botanical loop).

---

## Commands

```bash
# Tier breakdown + discovery-only list
npm run trails:state-forest-gap

# fd56 HTML vs app
npm run trails:forestry-gap

# PDF leaflets vs heroes
npm run trails:forestry-leaflet-gap

# Visit Cyprus heroes
npm run trails:fetch-images

# Forestry PDF crops
npm run trails:extract-forestry-heroes
```

---

## Mega map PDF (deferred)

[Informative Leaflet — Akamas / Troodos / Kavo Gkreko](https://www.moa.gov.cy/moa/fd/fd.nsf/All/4269544DF440E9D4C22583C10026422E?OpenDocument) (~158 MB). Historical i4WALKer guidebook listed **26** routes (5 Akamas + 16 Troodos + 5 Cape Gkreko)—a subset of the current Visit Cyprus **31**. Automated index extraction not implemented (image-heavy; requires full download + manual/OCR pass).

---

## Related

- `docs/TRAIL_IMAGE_INTAKE.md` — Visit Cyprus heroes
- `docs/TRAIL_FORESTRY_INTAKE.md` — fd56 outside-forest workflow
- `scripts/trails/state-forest-catalog.ts` — tier constants
