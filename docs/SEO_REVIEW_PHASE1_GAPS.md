# SEO Phase 1 — Content Gaps (Cyprus Winter)

**Deliverable:** Phase 1 Discovery & Gap Analysis  
**Date:** March 2026  
**Source:** explore subagent

---

## 1. Pages without custom title or description

All main pages define metadata. Summary:

| Page | File | Status |
|------|------|--------|
| Wine routes (404) | `src/app/wine-routes/[slug]/page.tsx` | `generateMetadata` returns `{}` when route not found (line 24) |
| Other routes | Various | Metadata present |

**Recommendation:** For unknown wine route slugs, return a clear 404 title/description, e.g. `{ title: "Wine route not found | Cyprus Winter", description: "Cyprus winter wine routes: Krasochoria, Laona, Akamas, Commandaria. Browse wineries." }`.

---

## 2. Snippet text (first ~155 characters) — SEO weak spots

Snippets are built from `region + type + description` and often don't lead with winter or specific intents.

### Attractions (`src/data/attractions.ts`)

Examples where the first ~100 chars lack "winter" or intent keywords:

| ID | Current first 80 chars | Suggested change |
|----|------------------------|------------------|
| `amahti` | "City-kingdom ruins above Limassol Bay. Winter is the time..." | Start with "Best ancient ruins in winter" |
| `kolossi` | "Commandaria wine was made here for eight hundred years..." | Add "Winter visit" at the start |
| `palaipafos` | "Aphrodite's sanctuary. Quieter than the main Pafos mosaics..." | Lead with "Winter ruins" or "Best time" |
| `buffavento` | "Buffavento means Defier of the Winds. Forty-five minutes..." | Add "Best winter views" or similar at start |
| `cyprus-museum` | "Nine thousand years of Cypriot history..." | Lead with "Best rainy winter afternoon" |

### Wineries (`src/data/wineries.ts`)

Many descriptions start with generic winery info instead of winter and tastings:

| ID | Current first 80 chars | Suggested opening |
|----|------------------------|-------------------|
| `vlassides` | "Award-winning estate in the Krasochoria heartland..." | "Award-winning winter tastings in the Krasochoria heartland. Shiraz, Cabernet. Book ahead." |
| `tsangarides` | "Family winery on the Laona wine route, specializing in organic..." | "Organic winter tastings in the Laona wine villages. Stone-built tasting room, mountain views." |
| `vasilikon` | "Traditional winery on the Akamas peninsula route..." | "Winter tastings on the Akamas wine route. Commandaria, old vines. Pair with Adonis Trail." |
| `ktima-vassiliades` | "Estate winery in historic Omodos village..." | "Winter cellar tastings in Omodos. Stone architecture, Commandaria, Xynisteri. Book ahead." |
| `ayia-mavri` | "Boutique winery on the Laona plateau. Small-batch production..." | "Intimate winter tastings on the Laona plateau. Small-batch Xynisteri, Maratheftiko. Call ahead." |

### Trails (`src/data/trails.ts`)

Prefix is `region + length + difficulty`, so descriptions should carry winter and condition keywords:

| ID | Current first 100 chars | Suggested change |
|----|-------------------------|------------------|
| `artemis` | "The Artemis Trail is a seven-kilometre loop through Troodos National Forest Park..." | Add "Best Troodos winter trail. Seven-kilometre loop…" |
| `caledonia-falls` | "A short, rewarding trail to one of Cyprus's highest waterfalls..." | Add "Best winter waterfall hike. Short trail to Cyprus's highest falls…" |
| `adonis` | "The Adonis Trail starts at the Baths of Aphrodite and winds through..." | Add "Best Akamas winter hike. Starts at Baths of Aphrodite…" |
| `olympus-summit` | "A steep ascent to the highest point in Cyprus: 1,952 metres..." | Add "Cyprus's highest peak. Winter: snow/ice common Jan–Mar. Microspikes needed." |

---

## 3. Missing or weak alt text

| Location | Current alt | Issue |
|----------|------------|-------|
| `src/app/discover/[id]/page.tsx` L254 | `alt={wine.name}` | Minimal (e.g. "Xynisteri 2023", "Morokanella") — no winery or context |
| `src/app/regions/[slug]/page.tsx` L73 | `alt={`${trail.name}, ${trail.region} trail`}` | Missing "Cyprus winter" and brief trail info |
| `src/app/regions/[slug]/page.tsx` L109 | `alt={`${item.name}, ${item.region}`}` | Same — no "Cyprus winter" or type context |

**Suggested alts:**

- Wine bottles: `alt={`${wine.name} ${wine.variety ? `— ${wine.variety}` : ""} at ${a.name}, Cyprus winter wine`}`
- Region trails: `alt={`${trail.name}, ${trail.region}—${trail.lengthKm}km ${trail.difficulty} winter trail, Cyprus`}`
- Region items: `alt={`${item.name}, ${item.type} in ${item.region}—Cyprus winter`}`

---

## 4. Long-tail keyword opportunities

Content and structure are there, but metadata and snippets often don't target these terms.

### High value, missing or weak targeting

| Keyword phrase | Status | Suggestion |
|----------------|--------|------------|
| "best beaches Cyprus winter" | Beaches page title OK | Add "Best beaches in Cyprus for winter walks" to beaches meta description |
| "Troodos trail conditions December" | No explicit phrase | Add to trails index: "Troodos trail conditions and December hiking." |
| "Caledonia Falls winter" | In trail copy | Ensure first ~80 chars of trail description include "Caledonia Falls winter hike" |
| "Cyprus winery winter tastings" | Wineries page | Add "Cyprus winery winter tastings. Book ahead for heated terraces and cellar tastings." |
| "Kourion winter sunset" | In attraction copy | Add to Kourion description start: "Best winter sunset at Kourion theatre." |
| "Avakas Gorge winter" | In trail copy | Add "Best Avakas Gorge walk in winter (Dec–Apr). River low, no flash floods." |
| "Omodos winter" | In village copy | Add "Omodos village in winter. Zivania, monastery, cobbled square." |
| "Governor's Beach winter lunch" | In attraction copy | Lead with "Best winter coastal lunch. Governor's Beach, white cliffs, fish tavernas." |
| "Lefkara lace winter" | In village copy | Add "Lefkara lace in winter. Lacemakers in doorways, best light for photos." |
| "Cyprus December weather" | Weather page | Add "Cyprus December weather: coast 18–20°C, Troodos 8–12°C. What to pack." |

### New page or section ideas

- `/trails/conditions` — "Troodos trail conditions December" and "Trail conditions by month"
- `/guides/best-beaches-winter` — "Best beaches Cyprus winter" and "Winter beach walks"
- `/guides/cyprus-december` — "Cyprus December: weather, trails, wineries"

---

## 5. Summary by file

| File | Gaps |
|------|------|
| `src/data/attractions.ts` | Improve first ~100 chars of several descriptions (amahti, kolossi, palaipafos, buffavento, cyprus-museum) to lead with winter or intent |
| `src/data/wineries.ts` | Improve snippet start for vlassides, tsangarides, vasilikon, ktima-vassiliades, ayia-mavri |
| `src/data/trails.ts` | Add winter/conditions phrasing to first ~100 chars for artemis, caledonia-falls, adonis, olympus-summit |
| `src/app/discover/[id]/page.tsx` | Strengthen wine bottle alt text (L254) |
| `src/app/regions/[slug]/page.tsx` | Strengthen trail and item alt text (L73, L109) |
| `src/app/wine-routes/[slug]/page.tsx` | Add 404 metadata when route not found (L24) |
| `src/app/beaches/page.tsx` | Consider "best beaches Cyprus winter" in meta description |
| `src/app/trails/page.tsx` | Add "Troodos trail conditions December" in meta description |
| `src/app/wineries/page.tsx` | Add "Cyprus winery winter tastings" in meta description |
| `src/app/weather/page.tsx` | Add "Cyprus December weather" in meta description |
