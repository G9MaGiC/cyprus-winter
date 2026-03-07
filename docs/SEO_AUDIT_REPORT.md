# Cyprus Winter — SEO Deep Audit Report

**Date:** March 7, 2026  
**Scope:** All pages per `.cursor/agents/seo-copywriter.md` and `docs/SEO_ROADMAP.md`  
**Criteria:** Title ≤60 chars, Description 150–160 chars, single h1, h2→h3 hierarchy, canonical/alternates, OpenGraph, image alt text, JSON-LD

---

## Executive summary

| Metric | Status |
|--------|--------|
| Pages audited | 22 |
| Title OK (≤60) | 19 / 22 |
| Description OK (150–160) | 3 / 22 |
| Single h1 | 22 / 22 ✓ |
| Canonical set | 8 / 22 (where relevant) |
| JSON-LD | 5 pages |
| OG overrides | Layout only; key pages use defaults |

**Priority issues:** Most meta descriptions are 100–140 chars (too short). Airport and bookings descriptions are critically short (76 chars). Several pages lack canonical URLs. Wine-route title may exceed 60 chars for long route names.

---

## Comprehensive audit table

| Page | Title OK? | Title (chars) | Desc OK? | Desc (chars) | h1 | h2→h3 | Canonical | OG | Alt text | JSON-LD | Missing / Suggested fixes |
|------|-----------|---------------|----------|--------------|-----|-------|-----------|-----|----------|---------|---------------------------|
| **Home** `/` | ✓ | 39 | ⚠ | ~123 | Cyprus Winter | sr-only h2s | Layout | Layout | ✓ Kourion | WebSite | **Desc short** (123). Extend to 150–160. Add benefit hook: e.g. "Sixteen degrees when home is six. Plan trails, wineries, villages. Free trip planner." |
| **Discover** `/discover` | ✓ | 43 | ⚠ | ~139 | Discover Cyprus Winter | N/A (list) | ❌ | ❌ | ✓ Omodos | ❌ | **Desc short** (139). Add canonical `/discover`. Optional OG override. Add ItemList JSON-LD for discover sections. |
| **Discover [id]** `/discover/[id]` | ✓ | ~25–45 | ⚠ | varies | Place name | h2 Highlights, h3 Great for; h2 Visit & taste, etc. | ✓ | ❌ | ✓ | TouristAttraction, Winery, BreadcrumbList | Some descriptions may be &lt;150 chars. Ensure snippet logic keeps 150–160. Add OG image override with place image. |
| **Trails** `/trails` | ✓ | 48 | ⚠ | ~108 | Cyprus Winter Trails | N/A | ❌ | ❌ | ✓ Troodos | ❌ | **Desc short** (108). Expand to 150–160. Add canonical `/trails`. Consider ItemList JSON-LD for trails. |
| **Trails [id]** `/trails/[id]` | ✓ | ~30–50 | ⚠ | varies | Trail name | h2 Latest from hikers, Safety, Route map, etc. | ✓ | ❌ | ✓ | TouristAttraction, BreadcrumbList | Desc length varies; ensure 150–160. Add OG image with trail photo. Consider HikingTrail schema. |
| **Trails report** `/trails/[id]/report` | ✓ | 36 | N/A | 61 | Report trail conditions | N/A | ❌ | ❌ | N/A | ❌ | **noindex** ✓. Canonical not needed. OK as utility page. |
| **Weather** `/weather` | ✓ | 45 | ⚠ | ~118 | Cyprus Winter Weather by Month | table only | ❌ | ❌ | N/A | ❌ | **Desc short** (118). Extend to 150–160: "Cyprus winter weather by month: coast 18–20°C, Troodos 8–12°C. Pack layers, plan trails and wineries. November to April. Sixteen degrees when home is six." |
| **Weather [month]** `/weather/[month]` | ✓ | ~45 | ⚠ | ~90–130 | Cyprus Winter Weather: {Month} | h2 What to expect, h3 Coast/Troodos; h2 Winter events | ✓ | ❌ | N/A | ❌ | **Desc short** (dynamic). Ensure 150–160. Add OG override for share cards. |
| **Beaches** `/beaches` | ✓ | 43 | ⚠ | ~125 | Cyprus Beaches in Winter | h2 sr-only | ❌ | ❌ | ✓ via AttractionCard | ❌ | **Desc short** (125). Add canonical. Extend desc. Consider ItemList for beaches. |
| **Wineries** `/wineries` | ✓ | 47 | ⚠ | ~107 | Cyprus Wineries in Winter | h2 sr-only | ❌ | ❌ | ✓ via AttractionCard | ❌ | **Desc short** (107). Add canonical. Extend to 150–160: "Cyprus winter wineries: Krasochoria, Laona, Commandaria. Fireside tastings, cosy cellars. Book ahead. Sixteen degrees when home is six." |
| **Villages** `/villages` | ✓ | 46 | ⚠ | ~108 | Cyprus Villages in Winter | ❌ | ❌ | ❌ | ✓ via AttractionCard | ❌ | **No h2** for list; add sr-only h2. **Desc short** (108). Add canonical. |
| **Regions [slug]** `/regions/[slug]` | ✓ | ~25–35 | ⚠ | varies | config.title | h2 Trails, Villages, Beaches, etc. | ✓ | ❌ | ✓ | ❌ | Region descriptions from config: Troodos ~130, others shorter. Standardize 150–160. Add CollectionPage or ItemList JSON-LD. |
| **Wine routes [slug]** `/wine-routes/[slug]` | ⚠ | ~50–60 | ⚠ | varies | {Route} Wine Route | N/A | ✓ | ❌ | ✓ via AttractionCard | ❌ | **Title** "Krasochoria Wine Route Cyprus Winter \| Wineries & Tastings" = 52 ✓. Laona/Akamas similar. Ensure desc 150–160. Add h2 for list. |
| **Guides troodos-december** `/guides/troodos-december` | ✓ | 47 | ✓ | ~148 | Best Troodos Trails in December | h2 December picks, h2 All Troodos | ❌ | ❌ | ✓ | ❌ | Add canonical. Consider Article schema. |
| **Events** `/events` | ✓ | 47 | ⚠ | ~119 | Winter events | h2 Don't miss; h2 Nov, Dec, etc.; h2 Planning tips | ❌ | ❌ | ✓ Kykkos | ItemList, Event | **Desc short** (119). Add canonical. Extend desc to 150–160. |
| **Plan** `/plan` | ✓ | 38 | ⚠ | ~113 | Plan your Cyprus winter trip | h2 Start here; h3 Day N, Pair with… | ❌ | ❌ | N/A | ❌ | **Desc short** (113). Add canonical. Extend. Plan is high-intent; strong desc helps. |
| **Airport** `/airport` | ✓ | 36 | ❌ | **76** | Just landed? | h2 Essential numbers (sr-only); h2 LCA, PFO | ❌ | ❌ | N/A | ❌ | **CRITICAL: Desc 76 chars.** Expand: "Larnaca & Paphos arrivals: taxis, buses, car hire. Coast mild, Troodos cooler. Essential numbers, tips. Just landed? Start here." (~120→150). Add canonical. |
| **Bookings** `/bookings` | ✓ | 29 | ❌ | **76** | My bookings | h2 Today, This week, Later; h2 Past & cancelled | ❌ | ❌ | N/A | ❌ | **CRITICAL: Desc 76 chars.** Extend: "View and manage your Cyprus Winter winery tastings and experiences. All bookings in one place. Sync from any device." Add canonical. Consider noindex if user-specific (optional). |
| **Search** `/search` | ✓ | 44 | ⚠ | ~125 | Search Cyprus Winter | N/A | ❌ | ❌ | N/A | ❌ | **Desc short** (125). Add canonical. Consider noindex for empty query (many search pages noindex the base). |
| **Team** `/team` | ✓ | 44 | ⚠ | ~117 | Our Team | h2 per member (should be h3) | ❌ | ❌ | ❌ (avatars) | ❌ | **Heading issue:** Team cards use h2 for names → should be h3 under single h1. **Desc short** (117). Add canonical. |
| **Secrets** `/secrets` | ✓ | 48 | ⚠ | ~127 | Cyprus Winter Local Secrets | h2 sr-only | ❌ | ❌ | N/A | ❌ | **Desc short** (127). Add canonical. Add ItemList for secret gems. |
| **Book winery [id]** `/book/winery/[id]` | ✓ | ~35–50 | ⚠ | ~85 | Book a tasting | N/A | ✓ | ❌ | N/A | ❌ | **Desc short** (85). Extend: "{Region}. Winter tastings are cosy—fire, heaters, owner often pouring. Book ahead. Confirmation by email." Add OG. |

---

## Heading hierarchy summary

| Page | h1 | h2 | h3 | Issue |
|------|----|----|-----|-------|
| Home | Cyprus Winter | sr-only (Explore, This week, Editor's picks, Planning, Why Cyprus, Share) | Plan your trip, Winter events | ✓ |
| Discover | Discover Cyprus Winter | (sections in DiscoverClient) | — | Check DiscoverClient for h2 |
| Discover [id] | Place name | Highlights, Visit & taste, Practical info, Book & contact, Our wines, Local secret, etc. | Great for | ✓ |
| Trails | Cyprus Winter Trails | (filter sections) | — | ✓ |
| Trails [id] | Trail name | Latest from hikers, Safety, Route map, etc. | — | ✓ |
| Weather [month] | Cyprus Winter Weather: {Month} | What to expect, Winter events | Coast, Troodos | ✓ |
| Regions [slug] | config.title | Trails, Villages, Beaches, Ancient, Wineries, Events, Monasteries | — | ✓ |
| Events | Winter events | Don't miss, Nov–Mar, Planning tips | — | ✓ |
| Plan | Plan your Cyprus winter trip | Start here | Day N, Pair with…, Browse all | ✓ |
| Airport | Just landed? | LCA, PFO (airport names) | Transport, Things to know | ✓ |
| Bookings | My bookings | Today, This week, Later, Past, Book more | — | ✓ |
| Team | Our Team | Member names (h2) | — | **Fix:** Use h3 for member names under h1 |
| Secrets | Cyprus Winter Local Secrets | sr-only | Secret cards (h3) | ✓ |
| Villages | Cyprus Villages in Winter | — | — | **Add** sr-only h2 "Cyprus winter villages" |
| Wine routes | {Route} Wine Route | — | — | **Add** sr-only h2 for list |

---

## Canonical & alternates

| Page | Canonical | Alternates | Note |
|------|-----------|------------|------|
| Home | [locale] layout | languages (hreflang) | ✓ |
| Discover, Trails, Beaches, Wineries, Villages, Events, Plan, Airport, Bookings, Search, Team, Secrets, Weather | ❌ | — | Add canonical for each |
| Discover [id], Trails [id], Weather [month], Regions [slug], Wine routes [slug], Book winery [id] | ✓ | — | ✓ |

---

## OpenGraph & Twitter

- **Layout** provides default OG/twitter (Kourion image, title, description).
- **Page-level overrides:** None on key landing pages (Discover, Trails, Weather, Beaches, Wineries, Events).
- **Suggested:** Add `openGraph.images` override for discover/[id], trails/[id], weather/[month] with page-specific image.

---

## Image alt text

| Component / Page | Alt pattern | Status |
|------------------|-------------|--------|
| HomeHero | "Kourion ancient theatre, Mediterranean coast, Cyprus winter" | ✓ |
| DetailHero (discover, trails) | `{name}, {region}—{type} in Cyprus winter` | ✓ |
| AttractionCard | `{name}, {region}—{type} in Cyprus winter light` | ✓ |
| TrailCard | `{name}, {region}—{trail}km {difficulty} trail in Cyprus winter` | ✓ |
| Regions PlaceCard | `{name}, {type} in {region}—Cyprus winter` | ✓ |
| Winery wine images | `{wine} — {variety} at {winery}, Cyprus winter wine` | ✓ |
| Team | Avatar placeholders (no img) | N/A |
| ListPageHero | `backgroundImageAlt` prop used | ✓ |

---

## JSON-LD structured data

| Page | Schema | Status |
|------|--------|--------|
| Layout | WebSite | ✓ |
| Discover [id] | TouristAttraction / Restaurant, Winery, BreadcrumbList | ✓ |
| Trails [id] | TouristAttraction, BreadcrumbList | ✓ Consider HikingTrail |
| Events | ItemList of Event | ✓ |
| Other list pages | — | Consider ItemList for discover, trails, beaches, wineries |

---

## Recommended fixes (prioritized)

### P0 — Critical
1. **Airport** — Extend meta description from 76 to 150–160 chars.
2. **Bookings** — Extend meta description from 76 to 150–160 chars.

### P1 — High
3. **All pages** — Extend descriptions to 150–160 chars (19 pages short).
4. **Team** — Change member names from h2 to h3.
5. **Villages, Wine routes** — Add sr-only h2 for list sections.

### P2 — Medium
6. **Canonical URLs** — Add to: discover, trails, weather, beaches, wineries, villages, events, plan, airport, bookings, search, team, secrets, guides/troodos-december.
7. **OG overrides** — Add page-specific OG images for discover/[id], trails/[id], weather/[month].
8. **Wine route titles** — Audit for >60 chars with long route names.

### P3 — Low
9. **JSON-LD** — Add ItemList to discover, trails, beaches, wineries.
10. **Trails [id]** — Consider HikingTrail schema.
11. **Guides** — Add Article schema.

---

## File reference for fixes

| Fix | File(s) |
|-----|---------|
| Airport desc | `src/app/airport/page.tsx` |
| Bookings desc | `src/app/bookings/layout.tsx` |
| Discover desc, canonical | `src/app/discover/page.tsx` |
| Trails desc, canonical | `src/app/trails/page.tsx` |
| Weather desc, canonical | `src/app/weather/page.tsx` |
| Beaches, Wineries, Villages desc + canonical | `src/app/beaches/page.tsx`, `wineries/page.tsx`, `villages/page.tsx` |
| Events desc, canonical | `src/app/events/layout.tsx` |
| Plan desc, canonical | `src/app/plan/layout.tsx` |
| Team h2→h3 | `src/app/team/page.tsx` |
| Region descriptions | `src/data/regions.ts` |
| Layout (home) desc | `src/app/layout.tsx` |
