# Vision Team Complete Project Review

**Date:** March 6, 2026  
**Teams:** TEAM_VISUAL_QA (branding-redesign, ux-polish, explore) + TEAM_REVIEW (senior-software-engineer, content-polish, audit-explore, shell)

---

## Executive Summary

| Category | P0 / Critical | P1 / High | P2 / Medium | Low |
|----------|---------------|-----------|-------------|-----|
| Design system | 0 | 4 | 3 | — |
| Layout / UI | 3 | 3 | 4 | — |
| Code / Architecture | 4 | 6 | 5 | — |
| Content | 0 | 2 | 5 | — |
| Audit | 1 | 4 | 3 | 4 |
| Build | — | — | — | ✓ Passed |

**Build & Lint:** Passed (7.1s, 287 static pages, no violations)

---

## 1. Design System

### 1.1 Hardcoded Hex / RGBA (P1–P2)

| File:Line | Current | Suggested |
|-----------|---------|-----------|
| `src/app/globals.css:48,105` | `rgba(13, 148, 136, 0.15)`, `rgba(13, 148, 136, 0.2)` | `color-mix` or add `--terracotta-15`, `--terracotta-20` |
| `src/components/TrailDetailStickyActions.tsx:33` | `shadow-[0_-4px_12px_rgba(0,0,0,0.06)]` | Use CSS var or `color-mix` |
| `src/components/TrailMap.tsx:22,43`, `AllTrailsMap.tsx:22` | `rgba(0,0,0,0.3)` etc. | Use design token or `color-mix` |

### 1.2 Unused Token: limestone (P1)

Replace all `bg-limestone` with `bg-sand` and remove `--color-limestone` from globals.css.

| File | Lines |
|------|-------|
| `src/app/trails/TrailsClient.tsx` | 62, 72 |
| `src/app/trails/[id]/page.tsx` | 107, 111 |
| `src/app/plan/page.tsx` | 96 |
| `src/app/plan/loading.tsx` | 5 |
| `src/app/trails/loading.tsx` | 5 |
| `src/app/bookings/page.tsx` | 115 |
| `src/app/bookings/loading.tsx` | 5 |
| `src/app/events/page.tsx` | 169, 296 |

### 1.3 Card Pattern Inconsistencies (P2)

| File:Line | Issue |
|-----------|-------|
| `RelatedPlacesBlock.tsx:16` | `rounded-lg` → use `rounded-xl` to match CARD |
| `events/page.tsx:333` | `border-golden/30` — consider `CARD.base` + `border-l-4 border-l-golden` |

### 1.4 Tip / Callout Box Borders (P1)

| File:Line | Current | Suggested |
|-----------|---------|-----------|
| `admin/stats/page.tsx:151,159,177` | `border-sand-200` | `border-olive/10` for olive callouts |

### 1.5 FilterChips Ring Offset (P1)

| File:Line | Current | Suggested |
|-----------|---------|-----------|
| `FilterChips.tsx:19` | `ring-offset-transparent` | `ring-offset-background` |

### 1.6 Border Consistency (P2)

| File | Use `border-sand-200/80` to align with CARD |
|------|--------------------------------------------|
| `regions/[slug]/page.tsx:282`, `weather/[month]/page.tsx:89,114`, `AIAssistant.tsx:280,439,456` | |

### 1.7 SKILL vs Implementation Drift

Update `.cursor/skills/cyprus-tourism-app/SKILL.md` so token hex values match `globals.css` / `design-tokens.ts`. PRD also lists different palette; unify docs.

---

## 2. Layout / UI

### 2.1 P0 — Must Fix

| Issue | Files | Fix |
|-------|-------|-----|
| Page wrapper vertical padding | `plan/page.tsx:97`, `airport/page.tsx:21`, `trails/loading.tsx:6`, `discover/[id]/page.tsx`, `trails/[id]/page.tsx` | Standardize: list pages `py-12 sm:py-16`; detail/form `py-8 sm:py-12`; loading match page |
| Winery booking loading | `book/winery/[id]/loading.tsx:6` | Replace `px-6` with `LAYOUT.safeAreaX` |
| Layout footer | `layout.tsx:89` | Replace `px-6` with `LAYOUT.safeAreaX` |

### 2.2 P1 — Should Fix

| Issue | Files |
|-------|-------|
| Card padding vs `CARD.content` | `airport/page.tsx:33,92`, `plan/loading.tsx:10`, `plan/page.tsx:108`, `discover/loading.tsx:7`, `events/page.tsx:59` |
| Section spacing mix | `admin/stats`, `plan/page.tsx`, `PageHeader`, `airport/page.tsx`, `events/page.tsx`, `TrailsClient` — use `SECTION.headingGap` / `SECTION.blockGap` where applicable |

### 2.3 P2 — Polish

| Issue | Details |
|-------|---------|
| Emergency text format | Use one pattern: `<strong className="font-bold">112</strong>` consistently (airport uses it; others don’t) |
| Error / not-found | Use `LAYOUT.safeAreaX` instead of `px-6` |
| Touch targets < 44px | Footer nav links, AddToItineraryButton "View plan →" — add `min-h-[44px]` |
| Loading vs page wrapper | `events/loading.tsx` — align with list vs detail convention |

### 2.4 Callout / Chip Inconsistencies

- **Emergency numbers:** Airport uses `font-bold`; others use `<strong>` only or plain text.
- **Filter chips:** FilterChips uses olive active; Events and PlacePicker use terracotta — unify semantic meaning.
- **Outline buttons:** Airport and WineryBookingForm use `border-2`; others use `border`.

---

## 3. Code / Architecture

### 3.1 P0 — High Priority

| # | Issue | File(s) | Action |
|---|-------|---------|--------|
| 1 | Restaurants missing in related places | `src/lib/related-places.ts:23–46` | Add restaurants lookup; extend `RelatedPlace.type` with `"restaurant"` |
| 2 | Duplicate base URL construction | Multiple pages + lib | Add `src/lib/site-url.ts`: `export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL \|\| "https://cypruswinter.com"` |
| 3 | TrailConditions type vs usage | `src/data/trails.ts:41–48,688` | Drop `trailId` from type or document invariant and add runtime check |
| 4 | Trail [id] layout mismatch | `src/app/trails/[id]/layout.tsx` | Add slug variants to `generateStaticParams` |

### 3.2 P1 — Medium Priority

| # | Issue | Action |
|---|-------|--------|
| 5 | Inconsistent server/client layout | Add server wrapper for Trails (like Discover); consider for Plan/Bookings |
| 6 | BackLink vs PageHeader | Standardize back link + header via shared abstraction |
| 7 | Repeated CTA styles | Add `Button` variants (primary, secondary, ghost) |
| 8 | useItinerary dependencies | Use functional `setDays((prev) => ...)` to avoid `days` dependency |
| 9 | Attraction vs Winery model | Document relationship or introduce shared `DiscoverPlace` base type |
| 10 | SectionCard in trail detail only | Extract to `src/components/SectionCard.tsx` |

### 3.3 P2 — Tech Debt

| # | Issue |
|---|-------|
| 11 | bg-background vs bg-limestone — pick one semantic name |
| 12 | TrailsClient FilterChips duplication — extract `TrailFilters` component |
| 13 | Plan page inline TimelineRow — extract to module |
| 14 | Schema/JSON-LD repeated — add `src/lib/schema.ts` helpers |
| 15 | Minimal plan/bookings layouts — document or consolidate |

---

## 4. Content

### 4.1 P1 — High Priority

| File | Change |
|------|--------|
| `src/app/install/page.tsx` | Add `robots: { index: false, follow: false }` |
| `src/data/events.ts` | Add brief note about Bellapais/Kyrenia (TRNC, checkpoints) |

### 4.2 P2 — Medium Priority

| File | Change |
|------|--------|
| `src/app/bookings/page.tsx` | Soften "No bookings found for that email"; improve empty state copy |
| `src/data/attractions.ts` | Qualify Nissi "top 25" claim or remove if unverifiable |
| `src/data/wineries.ts` | Confirm Kyperounta elevation (1,400 m) |

### 4.3 P3 — Polish

| Area | Change |
|------|--------|
| Layout, page, airport | Unify "Arriving" vs "Just landed?" |
| Search | Add stronger title/description in metadata |
| Discover | Standardize "Eat" vs "Eat & drink" |

---

## 5. Audit

### 5.1 Critical

| Issue | File | Action |
|-------|------|--------|
| Email booking link hardcodes domain | `src/lib/email.ts:41` | Use `process.env.NEXT_PUBLIC_SITE_URL \|\| "https://cypruswinter.com"` |

### 5.2 High

| Issue | Action |
|-------|--------|
| BottomNav omits Arriving, Secrets, Account, Team | Add paths or explicit mobile navigation |
| PRD vs implementation palette | Align PRD/docs with current teal palette or update code to match PRD |
| Rate limiting in-memory | Document Redis/Vercel KV for multi-instance deployments |

### 5.3 Medium

| Issue |
|-------|
| PRD roadmap: Phase 2/3 items (Group hike, Cyprus Wrapped) not implemented |
| README: missing Weather, Wineries, Beaches, Villages, Wine routes, Regions, Guides, Secrets, Install |

### 5.4 Low

| Issue |
|-------|
| Domain mismatch: cyprus-winter.app vs cypruswinter.com — unify via env |
| Account page back link — acceptable but minimal |
| Sitemap overlap between discoverPages and restaurantPages |
| SECTION token underused |
| PRD typography vs implementation (resolved: Plus Jakarta Sans) |

---

## 6. Build

- **Build:** Succeeded (7.1s)
- **Lint:** No violations
- **Static pages:** 287
- No slow route or bundle size warnings

---

## Recommended Fix Order

1. **Critical:** `src/lib/email.ts` — use `NEXT_PUBLIC_SITE_URL` for booking confirmation link.
2. **P0 design:** Replace `limestone` with `sand`; fix olive callout borders; FilterChips ring offset.
3. **P0 layout:** Standardize page wrapper padding; use `LAYOUT.safeAreaX` in footer and winery loading.
4. **P0 code:** `related-places.ts` restaurants; `site-url.ts`; trail static params.
5. **P1 design:** rgba → tokens; SKILL/PRD alignment.
6. **P1 content:** Install page robots; Bellapais/TRNC note.
7. **P1 audit:** BottomNav coverage; rate limit documentation.

---

## Agent Outputs (Reference)

- Design system: branding-redesign (aab5c975)
- UI consistency: ux-polish (82d6326c)
- Visual discovery: explore (ce55f623)
- Code & architecture: senior-software-engineer (2defb7f8)
- Content & copy: content-polish (5fb0c522)
- Exploration & audit: audit-explore (f2a4c737)
- Build & lint: shell (5303343f)
