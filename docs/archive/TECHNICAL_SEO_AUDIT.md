**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Technical SEO Audit — Cyprus Winter (Phase 3)

**Date:** March 2026  
**Scope:** Next.js app — metadata, sitemap, robots, structured data, canonicals, internal links, Core Web Vitals  
**Reference:** `docs/SEO_REVIEW_PLAN.md` Phase 3, `docs/SEO_REVIEW_PHASE1_GAPS.md`

---

## 1. Metadata

### 1.1 Summary

| Route | File | Type | Status |
|-------|------|------|--------|
| `/` | `src/app/page.tsx` | (inherits layout) | OK |
| `src/app/layout.tsx` | Root | title, description, OG, Twitter, WebSite JSON-LD | OK |
| `/discover` | `discover/page.tsx` | metadata export | OK |
| `/discover/[id]` | `discover/[id]/page.tsx` | generateMetadata + canonical | OK |
| `/trails` | `trails/page.tsx` | metadata export | OK |
| `/trails/[id]` | `trails/[id]/page.tsx` | generateMetadata + canonical | OK |
| `/trails/[id]/report` | `trails/[id]/report/page.tsx` | metadata + **robots: noindex** | Fixed |
| `/events` | `events/layout.tsx` | metadata | OK |
| `/wineries` | `wineries/page.tsx` | metadata | OK |
| `/book/winery/[id]` | `book/winery/[id]/page.tsx` | generateMetadata + canonical | OK |
| `/regions/[slug]` | `regions/[slug]/page.tsx` | generateMetadata + canonical; 404 fallback | Fixed |
| `/wine-routes/[slug]` | `wine-routes/[slug]/page.tsx` | generateMetadata + canonical; 404 fallback | OK (already had 404) |
| `/weather` | `weather/page.tsx` | metadata | OK |
| `/weather/[month]` | `weather/[month]/page.tsx` | generateMetadata + canonical; invalid slug fallback | Fixed |
| `/beaches`, `/villages`, `/secrets`, `/plan`, `/airport`, `/search` | Various | metadata | OK |
| `/team`, `/bookings`, `/install`, `/guides/troodos-december` | Various | metadata | OK |
| `/account` | `account/page.tsx` | metadata + **robots: noindex** | Fixed |

### 1.2 Fixes applied

- **Regions unknown slug:** `generateMetadata` now returns a proper title/description when slug is not in `REGION_CONFIGS` (was `{}`).
- **Weather invalid month:** `generateMetadata` now returns a 404-style title/description for invalid month slugs (was `{}`).
- **Trail report:** Added metadata with `robots: { index: false, follow: true }` so the form page is not indexed.
- **Account:** Added `robots: { index: false, follow: true }` so user account page is not indexed.

### 1.3 Recommendations (P2)

- **Homepage:** Consider exporting explicit `metadata` in `src/app/page.tsx` (e.g. override title to “Cyprus Winter | Trails, Wineries & Villages”) so the homepage is explicit in code; currently it inherits layout only.
- **OG images for dynamic pages:** Add `openGraph.images` and `twitter.images` in `generateMetadata` for `/discover/[id]` and `/trails/[id]` using the same image as the hero (improves social sharing).

---

## 2. Sitemap and robots.txt

### 2.1 Current state

- **`src/app/sitemap.ts`:** Exists; `force-static`; returns a single sitemap array.
- **`src/app/robots.ts`:** Exists; allows `/`; disallows `/admin/`, `/api/`; sitemap URL set.

### 2.2 Coverage

Included in sitemap:

- Static: `/`, `/discover`, `/trails`, `/events`, `/plan`, `/airport`, `/search`, `/secrets`, `/beaches`, `/wineries`, `/weather`, `/villages`, `/weather/december|january|february|march`, `/regions/troodos|paphos|ayia-napa|larnaca|limassol`, `/wine-routes/krasochoria|laona|akamas|commandaria`, `/guides/troodos-december`, `/team`, `/bookings`, **`/install`** (added).
- Dynamic: all `/discover/[id]`, all `/trails/[id]`, all `/book/winery/[id]`.

Excluded by design:

- `/account` (noindex; not in sitemap).
- `/trails/[id]/report` (noindex; not in sitemap).
- `/admin/*` (disallowed in robots).

### 2.3 Fixes applied

- **lastmod:** Added `lastmod: new Date().toISOString()` for homepage and all dynamic entries (discover, trails, book/winery) so crawlers get a build-time lastmod.
- **Install page:** Added `/install` with `priority: 0.4`, `changeFrequency: "monthly"`.

### 2.4 Recommendations (P2)

- **Sitemap index:** If the number of URLs grows significantly (e.g. 1000+), consider splitting into multiple sitemaps and a sitemap index; Next.js supports returning multiple sitemaps.
- **lastmod for static pages:** Optional: add a fixed or build-time `lastmod` for key static pages (e.g. `/discover`, `/trails`) for consistency.

---

## 3. Structured data (JSON-LD)

### 3.1 Implemented

| Page | Schema | Location |
|------|--------|----------|
| Root | `WebSite` | `src/app/layout.tsx` (existing) |
| `/discover/[id]` | `TouristAttraction` | `src/app/discover/[id]/page.tsx` |
| `/discover/[id]` (wineries) | `Winery` (LocalBusiness) | Same file, conditional on `type === "winery"` |
| `/discover/[id]` | `BreadcrumbList` | Same file |
| `/trails/[id]` | `TouristAttraction` (trail) + `additionalProperty` (distance, difficulty) | `src/app/trails/[id]/page.tsx` |
| `/trails/[id]` | `BreadcrumbList` | Same file |
| `/events` | `ItemList` of `Event` (each event with name, description, location, url) | `src/app/events/layout.tsx` |

### 3.2 Recommendations (P1/P2)

- **P1 — Events:** Consider adding individual `Event` JSON-LD per event (e.g. in a future `/events/[id]` page if you add one). Currently only `ItemList` on the index.
- **P2 — Book winery:** Add `LocalBusiness` or `Winery` + `BreadcrumbList` on `/book/winery/[id]` (same pattern as discover/[id]).
- **P2 — Regions:** Add `BreadcrumbList` and `Place` or `TouristDestination` on `/regions/[slug]` for region landing pages.
- **P2 — Wine routes:** Add `BreadcrumbList` on `/wine-routes/[slug]`.

---

## 4. Canonical URLs

### 4.1 Implemented

Canonicals are set via `metadata.alternates.canonical` in `generateMetadata` for:

- `/discover/[id]`
- `/trails/[id]`
- `/book/winery/[id]`
- `/regions/[slug]`
- `/wine-routes/[slug]`
- `/weather/[month]`

Base URL: `process.env.NEXT_PUBLIC_SITE_URL || "https://cypruswinter.com"`.

### 4.2 Duplicate content risks

- **Trailing slashes:** Next.js default is no trailing slash; if the app is configured to allow both, canonicals avoid duplication. No change needed if trailing slashes are not used.
- **Query params:** Filtered views (e.g. `/discover?filter=beach`) use the same document; canonical is the plain `/discover` (inherited from layout). If you later add a dedicated layout for `/discover`, set `canonical: base + '/discover'` there.
- **Case:** Region and wine-route slugs are lowercase; 404 or redirect for wrong case is handled by `notFound()`; canonicals use the correct slug from params.

### 4.3 Recommendations (P2)

- Add explicit `metadataBase` in layout (already set) and ensure `NEXT_PUBLIC_SITE_URL` is set in production so all canonicals and OG URLs are correct.

---

## 5. Internal links

### 5.1 Hub pages

- **Discover (`/discover`):** Links to all attraction cards (spokes) via `AttractionCard` → `/discover/[id]`. Filter chips link to `/discover?filter=...`. No direct links to `/beaches`, `/wineries`, `/villages` from this page (those are category sections on the same page).
- **Trails (`/trails`):** `TrailsClient` links to `/trails/[id]` for each trail. No direct links to regions from trails index.
- **Regions (`/regions/[slug]`):** Links to trails (`/trails/[id]`), attractions (via cards), wineries; links to `/wineries`, `/plan`.

### 5.2 Nav and footer

- **Nav:** Home, Discover, Trails, Events, Plan, Bookings, Arriving (airport); More → Local secrets, Account, Team. **Not in nav:** Beaches, Wineries, Villages, Weather, Regions, Search (search is icon only).
- **Footer:** No links (only emergency copy). Consider adding a small link block: Discover, Trails, Events, Weather, Regions, Beaches, Wineries.

### 5.3 Orphan / weak links

| Page | Linked from | Recommendation |
|------|-------------|----------------|
| `/beaches` | Discover (section), sitemap | P2: Add “Beaches” to nav or footer so it’s one click from every page. |
| `/wineries` | Discover (section), nav “Discover” covers it | P2: Consider “Wineries” in nav/footer for intent “wine tastings Cyprus”. |
| `/villages` | Discover (section) | P2: Same as beaches; add to footer. |
| `/weather` | Sitemap, possibly homepage | P2: Add “Weather” to nav or footer. |
| `/regions/*` | Sitemap, region links from discover/detail | P1: Add “Regions” or “Troodos / Paphos / …” in nav or footer. |
| `/wine-routes/*` | Wineries page, sitemap | OK; reached from wineries hub. |
| `/guides/troodos-december` | Sitemap | P2: Link from `/trails` or `/regions/troodos` as “Troodos December guide”. |
| `/install` | Sitemap only | P2: Optional link in footer (“Deploy” / “Install”) for devs. |

### 5.4 Anchor text

- **Discover:** Card links use place name (good).
- **Trails:** Trail name (good). Consider adding a line such as “Explore [Region] trails” linking to `/regions/troodos` etc. with keyword-rich anchor text.
- **Regions:** “All Cyprus wineries”, “Plan your trip” — good. Add “Winter weather in [region]” → `/weather` where relevant.

---

## 6. Core Web Vitals

### 6.1 Images

- **Next/Image:** Used across the app; `sizes` set on hero and cards (e.g. `(max-width: 768px) 100vw, 800px` on detail pages; responsive breakpoints on grids).
- **Lazy loading:** Hero images use `priority`; below-the-fold images rely on default lazy loading (no explicit `loading="lazy"` needed for Next/Image). One explicit `loading="lazy"` on discover/[id] (wine images).
- **Quick win:** Ensure all content images use Next/Image with appropriate `sizes`; no raw `<img>` for content. Already the case in checked pages.

### 6.2 Fonts

- **Layout:** `Plus_Jakarta_Sans` and `Fraunces` from `next/font/google` with `variable` and subset `latin` — good for CLS and performance.
- **Quick win:** None; font loading is already optimized.

### 6.3 Scripts

- **Third-party:** ConversionTracker, AI assistant, analytics — ensure they are loaded after main content or with `strategy="lazyOnload"` where applicable. Not audited in depth; recommend checking in PageSpeed/Lighthouse.
- **JSON-LD:** Inline scripts in body; no impact on LCP.

### 6.4 Recommendations (P2)

- Run Lighthouse (mobile + desktop) on homepage, `/discover`, `/trails`, and one `/discover/[id]` and `/trails/[id]`; fix any LCP/CLS/INP issues (e.g. image dimensions, font-display).
- Ensure `priority` is only on LCP image (e.g. one hero per page); already the case on detail pages.

---

## 7. Severity summary

| Severity | Item | File / area | Action |
|----------|------|-------------|--------|
| P0 | — | — | None; critical issues addressed. |
| P1 | Link to regions from hub | Nav or footer | Add “Regions” or region links so region landing pages get more internal weight. |
| P1 | Event schema per event | Optional `/events/[id]` | If you add event detail pages, add `Event` JSON-LD per page. |
| P2 | OG images for dynamic pages | `discover/[id]`, `trails/[id]` generateMetadata | Set `openGraph.images` and `twitter.images` from hero image. |
| P2 | BreadcrumbList + schema on book/winery, regions, wine-routes | Respective page.tsx | Add JSON-LD for consistency and SERP breadcrumbs. |
| P2 | Footer links | `layout.tsx` or footer component | Add Beaches, Wineries, Villages, Weather, Regions (or key regions). |
| P2 | Link to Troodos December guide | `/trails` or `/regions/troodos` | Add one in-content link with anchor “Troodos December guide” or similar. |
| P2 | Lighthouse run | All | Measure and fix LCP/CLS/INP if needed. |

---

## 8. Files changed (this audit)

- `src/app/sitemap.ts` — lastmod, `/install`, dynamic lastmod.
- `src/app/discover/[id]/page.tsx` — canonical, JSON-LD (TouristAttraction, Winery, BreadcrumbList).
- `src/app/trails/[id]/page.tsx` — canonical, JSON-LD (TouristAttraction, BreadcrumbList).
- `src/app/trails/[id]/report/page.tsx` — metadata + noindex.
- `src/app/events/layout.tsx` — ItemList of Event JSON-LD.
- `src/app/book/winery/[id]/page.tsx` — canonical.
- `src/app/regions/[slug]/page.tsx` — canonical, 404 metadata when slug unknown.
- `src/app/wine-routes/[slug]/page.tsx` — canonical.
- `src/app/weather/[month]/page.tsx` — canonical, 404 metadata for invalid month.
- `src/app/account/page.tsx` — robots noindex.
