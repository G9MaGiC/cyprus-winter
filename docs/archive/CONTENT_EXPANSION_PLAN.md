**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Cyprus Winter — Content Expansion Plan & Execution

**Version:** 1.0  
**Target:** High-demand, low-competition SEO content. Thousands of organic visits per week.

---

## 1. Weather-by-Month Pages (Dec / Jan / Feb / Mar)

### Rationale
- Keyword: "cyprus winter weather december" etc. — 600–1.2K est. monthly searches, low competition
- `/weather` exists with full table; dedicated month pages capture long-tail queries

### Routes & structure
| Route | Primary keyword | Data source |
|-------|-----------------|-------------|
| `/weather/december` | cyprus winter weather december | weatherByMonth[1], winterEvents (Dec) |
| `/weather/january` | cyprus winter weather january | weatherByMonth[2], winterEvents (Jan) |
| `/weather/february` | cyprus winter weather february | weatherByMonth[3], winterEvents (Feb) |
| `/weather/march` | cyprus winter weather march | weatherByMonth[4], winterEvents (Mar) |

### Implementation
- **File:** `src/app/weather/[month]/page.tsx`
- **generateStaticParams:** december, january, february, march
- **Content:** Month row from weatherByMonth + intro copy + events for that month from winterEvents + CTAs (trails, wineries, plan)
- **Internal links:** Back to /weather, cross-links to adjacent months, /trails, /discover
- **Metadata:** Unique title and description per month

### Execution steps
1. Create `src/data/weather.ts` month slug map (month name → slug)
2. Create `src/app/weather/[month]/page.tsx` with generateStaticParams
3. Filter winterEvents by month (Nov→november, Dec→december, etc.)
4. Add to sitemap.ts

---

## 2. Region Landing Pages (Troodos ✓, Paphos, Ayia Napa, Larnaca, Limassol)

### Rationale
- Keywords: "Paphos winter", "Ayia Napa winter", "Larnaca winter", "Limassol winter" — 200–600 est. monthly
- Troodos exists at `/regions/troodos`; replicate pattern for other regions

### Region → data mapping
| Region | Attractions filter | Trails filter | Wineries filter | Events |
|--------|--------------------|---------------|-----------------|--------|
| **Paphos** | region includes Paphos | region === "Paphos" | region includes "(Paphos)" | region === "Paphos" |
| **Ayia Napa** | region in [Ayia Napa, Cape Greco, Protaras] | region === "Ayia Napa" | — | — |
| **Larnaca** | region includes Larnaca | — | region includes "Larnaca" | region === "Larnaca" |
| **Limassol** | region includes Limassol | — | region includes Limassol | region === "Limassol" |

### Routes & structure
| Route | Title | Sections |
|-------|-------|----------|
| `/regions/paphos` | Paphos Winter | Trails, beaches, ancient sites, wineries, events |
| `/regions/ayia-napa` | Ayia Napa & Cape Greco Winter | Beaches, Cape Greco trail, sea caves |
| `/regions/larnaca` | Larnaca Winter | Villages (Lefkara), ancient, wineries, events |
| `/regions/limassol` | Limassol Winter | Kourion, Kolossi, villages, wineries, events |

### Implementation
- **File:** `src/app/regions/[slug]/page.tsx` (shared component; Troodos can be migrated)
- **generateStaticParams:** troodos, paphos, ayia-napa, larnaca, limassol
- **Slug config:** Map slug → region filter logic (region string or array)
- **Reuse:** TrailCard, PlaceCard patterns from Troodos; CARD tokens

### Execution steps
1. Create `src/data/regions.ts` with slug config (title, description, filter logic)
2. Refactor Troodos page to use shared `RegionsPage` or create `regions/[slug]/page.tsx`
3. Implement filter helpers per region (attractions, trails, wineries, events)
4. Add to sitemap.ts

---

## 3. Wine Route Index Pages (Krasochoria, Laona, Akamas, Commandaria)

### Rationale
- Keyword: "cyprus wine routes winter", "Krasochoria wine", "Commandaria tasting" — 200–400 est. monthly
- Wineries have `wineRoute` field; filter by route

### Routes & data
| Route | wineRoute value | Wineries |
|-------|-----------------|----------|
| `/wine-routes/krasochoria` | Krasochoria | ~12 |
| `/wine-routes/laona` | Laona | ~10 |
| `/wine-routes/akamas` | Akamas | ~3 |
| `/wine-routes/commandaria` | Commandaria | ~8 |

### Implementation
- **File:** `src/app/wine-routes/[slug]/page.tsx`
- **generateStaticParams:** krasochoria, laona, akamas, commandaria
- **Data:** `wineries.filter(w => w.wineRoute?.toLowerCase() === slug)`
- **Content:** Route intro copy, winter tip, grid of AttractionCard (winery)
- **Metadata:** Unique title/description per route
- **Internal links:** /wineries, /discover?filter=winery, /plan

### Execution steps
1. Create `src/app/wine-routes/[slug]/page.tsx`
2. Add route config (title, description, slug)
3. Add to sitemap.ts

---

## 4. Category Indexes (beaches ✓, wineries ✓, villages)

### Rationale
- Beaches and wineries exist at `/beaches`, `/wineries`
- Villages missing; keyword "cyprus villages winter" — 250–400 est. monthly
- SEO slugs already used: /beaches, /wineries; add /villages

### Current state
| Category | Route | Status |
|----------|-------|--------|
| Beaches | `/beaches` | ✓ Exists |
| Wineries | `/wineries` | ✓ Exists |
| Villages | `/villages` | Missing |
| Ancient sites | `/ancient-sites` | Optional (P2) |
| Monasteries | `/monasteries` | Optional (P2) |

### Implementation for /villages
- **File:** `src/app/villages/page.tsx`
- **Data:** `villages` from `@/data/attractions`
- **Layout:** Same as beaches/wineries — PageHeader + AttractionCard grid
- **Metadata:** "Cyprus Villages Winter | Mountain & Wine Villages"

### Execution steps
1. Create `src/app/villages/page.tsx`
2. Add to sitemap.ts

---

## 5. Execution Order

| Phase | Task | Est. effort |
|-------|------|-------------|
| 1 | Weather-by-month pages | 1 file, ~150 lines |
| 2 | Villages category | 1 file, ~50 lines |
| 3 | Wine route pages | 1 file, ~120 lines |
| 4 | Region pages (Paphos, Ayia Napa, Larnaca, Limassol) | 1 shared file + config, ~200 lines |

---

## 6. Sitemap Update

Add to `src/app/sitemap.ts`:
- `/weather/december`, `/weather/january`, `/weather/february`, `/weather/march`
- `/villages`
- `/wine-routes/krasochoria`, `/wine-routes/laona`, `/wine-routes/akamas`, `/wine-routes/commandaria`
- `/regions/paphos`, `/regions/ayia-napa`, `/regions/larnaca`, `/regions/limassol`

---

## 7. Internal Linking Strategy

- Homepage / Discover: Add links to /weather, /beaches, /wineries, /villages, /regions/*
- Weather page: Add links to /weather/december etc.
- Region pages: Cross-link to other regions, weather, trails
- Wine routes: Link to /wineries, /discover?filter=winery
