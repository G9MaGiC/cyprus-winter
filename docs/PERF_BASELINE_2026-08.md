# Performance baseline — August 2026 (P3-04)

Production build (`next build && next start`), Playwright/Chromium, mobile viewport 375×812 @2x,
**4× CPU throttle** (CDP), cold cache, median of 3 runs per page. Localhost network, so
byte counts are decoded (uncompressed) sizes and network latency is ~zero — treat LCP/TTFB
as **relative** numbers for regression comparison, not field predictions. Long-task total is
the sum of main-thread task time beyond 50ms (TBT proxy). Onboarding/cookie overlays
suppressed via localStorage, matching the E2E suites.

## Baseline (after the raw-preload fix in this batch)

| Page | TTFB | FCP | LCP | CLS | Long tasks >50ms | JS | Images | HTML/RSC |
|------|-----:|----:|----:|----:|-----------------:|---:|-------:|---------:|
| `/` | 50ms | 456ms | 908ms | 0.004 | 453ms | 1.63MB | 170KB | 308KB |
| `/discover` | 128ms | 620ms | 2452ms | 0 | **3699ms** | 1.64MB | 152KB | **2033KB** |
| `/trails` | 42ms | 288ms | 1160ms | 0 | 746ms | 1.76MB | 242KB | 522KB |
| `/plan` | 26ms | 300ms | 900ms | 0.063 | 415ms | 1.67MB | 46KB | 244KB |
| `/events` | 30ms | 252ms | 896ms | 0 | 437ms | 1.56MB | 40KB | 314KB |
| `/airport` | 29ms | 264ms | 892ms | 0 | 289ms | 1.53MB | 23KB | 237KB |
| `/discover/nissi-beach` | 27ms | 364ms | 364ms | 0 | 350ms | 1.55MB | 34KB | 232KB |
| `/trails/artemis` | 28ms | 240ms | 868ms | 0 | 478ms | 1.71MB | 46KB | 249KB |
| `/book/winery` | 48ms | 288ms | 1092ms | 0 | 362ms | 1.53MB | 209KB | 633KB |
| `/he` (RTL) | 52ms | 420ms | 1200ms | 0.004 | 403ms | 1.63MB | 170KB | 343KB |

LCP element is the hero `next/image` on every page (`priority` + `fetchPriority="high"` in
`ListPageHero`), served at `w=750` (~23–58KB). Hebrew adds ~53KB of font (167KB vs 114KB)
for the two Hebrew faces — subset, `display: swap`.

## Fixed in this batch: raw hero preload double-download

`preload(HERO_IMAGE, { as: "image" })` on five pages preloaded the **raw original** while
the hero `<Image priority>` fetched the optimized `/_next/image?w=750` URL — so every cold
visit downloaded both, and the raw file (up to 2.1MB) competed with the actual LCP resource
for bandwidth. `next/image` with `priority` emits its own correctly-srcset preload, so the
manual calls were pure waste and were removed.

| Page | First-view image bytes before → after |
|------|--------------------------------------:|
| `/discover` | 2253KB → 152KB (−2.1MB raw omodos) |
| `/plan` | 2146KB → 46KB (−2.1MB raw omodos) |
| `/events` | 2094KB → 40KB (−2.05MB raw kykkos) |
| `/trails` | 678KB → 242KB (−436KB raw artemis) |
| `/airport` | (raw coast hero) → 23KB |

~6.7MB removed across these first views. On localhost the LCP delta is noise; on real
mobile connections this is multiple seconds of bandwidth contention per page.

Guard rule: **never `preload()` a `/images/...` path directly** — the browser will not
reuse it for `next/image`. If a manual preload is ever needed, build the URL with
`getImageProps` and pass `imageSrcSet`/`imageSizes`.

## Fixed in a follow-up batch: `/discover` overview capped at 6 cards/section

The overview rendered all 214 places as full cards (~2.0MB HTML, ~3.7s throttled
hydration). Now the multi-section view renders 6 cards per section with a localized
"Show all {count}" link to `/discover?filter=<sectionId>` — a view the server renders
complete (verified: 53 village places uncapped), so users and crawlers lose nothing;
JSON-LD keeps the full ItemList. Measured on `/discover` (same methodology):

| Metric | Before | After |
|--------|-------:|------:|
| HTML | 2028KB | 893KB |
| LCP (4× throttle) | 2452ms | 1012ms |
| Long tasks >50ms | 3699ms | 928ms |
| Unique places in DOM | 214 | 45 |

## Fixed in a follow-up batch: lean `DiscoverCardItem` across the client boundary

`DiscoverClient` received full catalog objects (~319KB of item JSON) as props. The
boundary now serializes `DiscoverCardItem` — exactly the fields AttractionCard, the map
(id lookup), and interest sorting consume (~136KB). Verified field-by-field: `seasonTags`,
`latitude/longitude`, `nameEl`, `editorialPriority`, `budgetLevel`, `transport`, `parking`
no longer appear in the payload. `/discover` total: 893KB → **816KB** (flight 549KB → 472KB).

## Open levers (in impact order)

1. **Item duplication across sections** — a place serialized once per section it appears
   in (~414 lean item instances for 237 places across standard + activity sections).
   Lever: serialize the item catalog once and give sections id lists. Diminishing returns
   at current sizes; revisit if the catalog grows.
2. **Shared JS ~1.5–1.8MB decoded (~500KB over the wire)** per first view. Typical for
   Next 16 + React 19 + next-intl + Leaflet-adjacent surfaces; no single outlier chunk.
3. `/book/winery` HTML is 633KB — winery dataset inlined; same capping pattern applies
   if the page ever grows.

## What is healthy

- CLS ≤ 0.063 everywhere (well inside the 0.1 budget); zero on most pages.
- TTFB ≤ 130ms server-side on every measured route.
- All hero images served via the optimizer at `w=750`; no raw image fetches remain.
- Fonts: subset, swap, and Hebrew faces load only on RTL.

## Re-measuring

The measurement script is intentionally not checked in (it needs repo-root module
resolution and a running `next start`). Recreate from this spec: Playwright +
`PerformanceObserver` for LCP/CLS/longtask (buffered), `performance.getEntriesByType("navigation")`
for TTFB, response-body byte accounting by resource type, 3 runs, median.
