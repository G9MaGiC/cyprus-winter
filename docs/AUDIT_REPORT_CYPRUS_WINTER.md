# Cyprus Winter — Audit Report

**Date:** 2026-03-06  
**Scope:** Gaps, broken patterns, security risks, PRD drift (vs PRD.md and README)  
**Reference:** `.cursor/agents/audit-explore.md`, PRD.md, README.md

---

## Summary

| Severity | Count |
|----------|--------|
| Critical | 0 |
| High | 2 |
| Medium | 8 |
| Low | 6 |

---

## 1. Navigation & Links

| Issue | File:Line | Severity |
|-------|-----------|----------|
| **Weather not in main nav** — PRD §3.2 "Weather-first" and README list Weather; Nav/BottomNav lack a Weather link. Users reach Weather only via footer or in-page links. | `src/components/Nav.tsx` (primaryLinks), `src/components/BottomNav.tsx` (primaryLinks) | **Medium** |
| **Nav vs BottomNav mismatch** — Desktop Nav has Arriving, Bookings; BottomNav has Search in primary and no Arriving. Mobile users cannot one-tap to Arriving. | `src/components/Nav.tsx` 10–17, `src/components/BottomNav.tsx` 8–19 | **Low** |
| **Account page no explicit back** — PageHeader used without `backHref`/`backLabel`; defaults to "/" and "Back". Works but is inconsistent with pages that set backLabel (e.g. "Home"). | `src/app/account/page.tsx` 16–19 | **Low** |
| **Admin stats back link** — "← Back to home" is a proper `<Link href="/">`. No issue. | — | — |

**Validated:** Internal links to `/discover`, `/trails`, `/plan`, `/bookings`, `/airport`, `/events`, `/weather`, `/regions/*`, `/wine-routes/*`, `/book/winery/[id]` exist and targets exist. Discover list uses `ListPageHero` back; sub-pages use `BackLink` or `PageHeader` with back. Nav uses `isActive(pathname, href)` for current route.

---

## 2. Design System

| Issue | File:Line | Severity |
|-------|-----------|----------|
| **PRD color drift — Terracotta** — PRD §3.1 specifies Primary Terracotta `#E07A5F`. Implementation uses `#0d9488` (teal) for `terracotta` in CSS and design tokens. Brand and "Mediterranean warmth" intent not met. | `src/app/globals.css` 7–8, 24–25; `src/lib/design-tokens.ts` 16–17 | **High** |
| **Aegean vs Terracotta overlap** — `aegean` and `terracotta` both set to `#0f766e` in globals.css; tokens distinguish names but same hex. Reduces palette distinctness. | `src/app/globals.css` 7–8, 13, 24–25, 30 | **Medium** |
| **No hardcoded hex in components** — Components use Tailwind tokens (e.g. `text-terracotta`, `bg-aegean`). Only design source files use hex; acceptable. | — | — |

---

## 3. Data & Content

| Issue | File:Line | Severity |
|-------|-----------|----------|
| **Discover filter params match section ids** — `filterToSectionId` maps `filter=` to section ids; sections are `beach`, `ancient`, `village`, `winery`, `eat`, `monastery`, `family`. Homepage and other links use these; no orphan filters. | `src/app/discover/DiscoverClient.tsx` 14–25, `src/app/discover/page.tsx` 34–41 | — |
| **Trail id/slug resolution** — Trail detail and API resolve by `t.id === id || t.slug === id`. Links use `/trails/${trail.id}` or `/trails/artemis` (id). Slug links (e.g. `/trails/artemis-trail`) also work. No broken trail links. | `src/app/trails/[id]/page.tsx` 26, 69; `src/app/api/trail-reports/route.ts` 38 | — |
| **Wine routes defined in page** — `WINE_ROUTES` is in `wine-routes/[slug]/page.tsx` instead of `src/data/`. README and PRD expect data in `src/data/` as single source of truth. | `src/app/wine-routes/[slug]/page.tsx` 10–15 | **Medium** |
| **getDiscoverPlaceById / getAttractionById** — Wineries are in `allAttractions` in `src/data/index.ts`; discover detail and metadata resolve attractions and wineries. No orphan discover ids found. | `src/data/index.ts` 14–20, 76–90 | — |

---

## 4. Architecture

| Issue | File:Line | Severity |
|-------|-----------|----------|
| **WINE_ROUTES not in data layer** — Wine route list lives in app page; should live in `src/data/` (e.g. `wine-routes.ts`) and be imported for static params, metadata, and any reuse. | `src/app/wine-routes/[slug]/page.tsx` 10–15 | **Medium** |
| **Server vs client** — List pages use server components where possible; DiscoverClient, Plan, Bookings, TrailsClient are client for state/URL. Appropriate. | — | — |
| **Duplicate nav link config** — `primaryLinks` / `moreLinks` duplicated between Nav and BottomNav with different sets. Single shared config would reduce drift. | `src/components/Nav.tsx` 10–24, `src/components/BottomNav.tsx` 8–19 | **Low** |

---

## 5. Security

| Issue | File:Line | Severity |
|-------|-----------|----------|
| **Track API: unvalidated `properties` and `sessionId`** — `body.properties` and `body.sessionId` are stored as-is. No size limit or schema; client could send large or arbitrary JSON. Risk: storage abuse, noisy analytics. | `src/app/api/track/route.ts` 23–40 | **High** |
| **Rate limiting in-memory** — README and rate-limit.ts note that multi-instance (e.g. Vercel) needs shared store (Upstash/Vercel KV). Without it, limits are per-instance. | `src/lib/rate-limit.ts` 1–6, README.md | **Medium** |
| **Admin stats protected** — Stats route checks `ADMIN_SECRET` via Bearer or x-admin-token; returns 401 when missing or wrong. | `src/app/api/stats/route.ts` 12–19, 40–41 | — |
| **Bookings API** — Zod schema, providerId validated against wineries, rate limit. Email validated for GET. | `src/app/api/bookings/route.ts` | — |
| **Trail reports API** — Zod schema, trailId validated against trails, note/email sanitized with `sanitizeForStorage`. | `src/app/api/trail-reports/route.ts` | — |
| **Chat API** — Schema validation, `sanitizeText` on message content, rate limit. | `src/app/api/chat/route.ts` | — |
| **dangerouslySetInnerHTML** — Used only for `JSON.stringify(schema)` with server-built schema (no user input). Low XSS risk; keep schema construction server-side only. | `src/app/layout.tsx` 72, `src/app/discover/[id]/page.tsx` 109–111, `src/app/trails/[id]/page.tsx` 108–109, `src/app/events/layout.tsx` 41 | **Low** |

---

## 6. PRD Drift

| Issue | File:Line | Severity |
|-------|-----------|----------|
| **Winter visual identity — Primary color** — PRD §3.1: Terracotta `#E07A5F`. App uses teal `#0d9488`. Direct conflict with "Winter Visual Identity System". | `src/app/globals.css`, `src/lib/design-tokens.ts` | **High** |
| **Weather-first home** — PRD §3.2: "Weather-first: Temperature prominently displayed". Home and nav do not prominently feature weather; Weather is in footer and linked from content. | `src/app/page.tsx`, `src/components/Nav.tsx` | **Medium** |
| **Phase 1 scope** — PRD §9: 25 winter attractions, basic trail conditions, 10 partner integrations, itinerary with winter templates. Implementation has many attractions, trail conditions (data + reports), winery booking, plan with templates; exact counts and "10 partners" not verified. | PRD.md §9 vs `src/data/`, `src/app/plan/`, `src/app/book/` | **Low** |
| **Typography** — PRD and implementation: Fraunces (headings), Plus Jakarta Sans (body). Docs aligned. | README.md, PRD.md, `src/app/layout.tsx` | **Resolved** |

---

## 7. Broken Patterns & Consistency

| Issue | File:Line | Severity |
|-------|-----------|----------|
| **Regions backLabel missing** — `PageHeader` given `backHref="/"` but no `backLabel`; defaults to "Back". Other list pages set e.g. "Home" or "Discover". | `src/app/regions/[slug]/page.tsx` 163–164 | **Low** |
| **Weather page backLabel missing** — Same as above; `backHref="/"` only. | `src/app/weather/page.tsx` 25–26 | **Low** |
| **Funnel vs track events** — Stats `FUNNEL_ORDER` includes `page_view`, `discover_view`, `winery_detail_view`, `shop_click`, `plan_add`, `booking_start`, `booking_complete`. Track API `ALLOWED_EVENTS` matches. No drift. | `src/app/api/stats/route.ts` 21–29, `src/app/api/track/route.ts` 6–14 | — |

---

## Recommendations (prioritised)

1. **Critical/High**
   - Align terracotta (and palette) with PRD §3.1 or update PRD to match current design.
   - Restrict track API: validate/sanitize `properties` (e.g. allowlist keys, max size) and validate `sessionId` (format/length).

2. **Medium**
   - Move `WINE_ROUTES` to `src/data/wine-routes.ts` and import in the wine-routes page.
   - Add Weather to main nav (or clearly document why it’s footer-only).
   - Document or implement shared rate-limit store for multi-instance (e.g. Vercel).

3. **Low**
   - Share a single nav config (e.g. in `src/lib/nav.ts` or a small constants module) for Nav and BottomNav.
   - Set explicit `backLabel` (e.g. "Home") on regions and weather `PageHeader`.
   - Typography docs aligned: Fraunces + Plus Jakarta Sans.

---

*End of audit report.*
