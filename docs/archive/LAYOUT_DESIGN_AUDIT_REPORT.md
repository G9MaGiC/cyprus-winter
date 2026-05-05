**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Layout Design Audit Report — Cyprus Winter

**Date:** 2026-03-06  
**Agents:** branding-redesign, ux-polish, audit-explore

---

## Executive Summary

Formal Layout Design Audit ran all three Visual QA agents in parallel. Findings were merged by category and severity. **P0: none.** Key P1 layout fixes were applied; remaining P1/P2 are documented for follow-up.

---

## Merged Findings by Category

### Layout

| Severity | Finding | File:Line | Status |
|----------|---------|-----------|--------|
| P1 | Weather table broke safe area on small screens (`-mx-4`) | weather/page.tsx:31 | **Fixed** — removed `-mx-4` |
| P1 | Root loading hero uses hardcoded `max-w-2xl` | loading.tsx:9 | **Fixed** — LAYOUT.form |
| P1 | Homepage hero uses hardcoded `max-w-2xl` | page.tsx:29 | **Fixed** — LAYOUT.form |
| P2 | Scroll strips use raw `-mx-1` / `px-1` | page.tsx, plan/page.tsx | Logged |

### Safe Area / Nav

| Severity | Finding | File:Line | Status |
|----------|---------|-----------|--------|
| P1 | Nav mobile drawer used 1rem vs LAYOUT.safeAreaX 1.5rem | Nav.tsx:165 | **Fixed** — pl/pr use 1.5rem |

### Card / Section Tokens

| Severity | Finding | File:Line | Status |
|----------|---------|-----------|--------|
| P1 | Airport checklist ad-hoc card styling | airport/page.tsx:146 | **Fixed** — CARD.base + CARD.content |
| P1 | Discover loading CardSkeleton body used `p-4` | discover/loading.tsx:7 | **Fixed** — CARD.content |
| P1 | Sections using CARD.contentLg without CARD.base | discover/[id], trails/[id], events, bookings, install, TrailsClient, SuggestedForDay | **Partially fixed** — discover/[id], trails/[id], events |
| P1 | weather/[month] card-like block without CARD | weather/[month]/page.tsx:93 | **Fixed** — CARD.base + CARD.contentLg |
| P1 | plan inline card (line 501) without CARD | plan/page.tsx:501 | **Fixed** — CARD.content |
| P2 | Redundant `rounded-xl` where CARD.base already provides it | Multiple | Logged |
| P2 | Root loading skeleton cards: use CARD.base | loading.tsx:29 | **Fixed** — CARD.base + CARD.content |

### Empty State

| Severity | Finding | File:Line | Status |
|----------|---------|-----------|--------|
| P1 | TrailsClient empty state overrides EMPTY_STATE with `py-20` | TrailsClient.tsx:237 | **Fixed** — EMPTY_STATE_LARGE token added and used |

### Section Spacing

| Severity | Finding | File:Line | Status |
|----------|---------|-----------|--------|
| P1 | Section spacing not using SECTION.headingGap / blockGap | install, search, events, plan, bookings, admin, not-found, error | Logged |
| P2 | p-4 vs CARD.content on discover/[id], trails/[id], TrailReportClient, plan | Various | Logged |

### Touch Targets

| Severity | Finding | File:Line | Status |
|----------|---------|-----------|--------|
| P2 | "View plan →" link in AddToItineraryButton &lt; 44px tap area | AddToItineraryButton.tsx:43–46 | **Fixed** — min-h-[44px] py-2 -my-2 |

### Other

| Severity | Finding | Status |
|----------|---------|--------|
| P2 | not-found CTA: padding may double with CTA classes | Logged |
| P2 | SKILL.md palette vs design-tokens (Mediterranean vs teal) | Doc — code is source of truth |

---

## Fixes Applied This Pass

1. **weather/page.tsx** — Removed `-mx-4` from table wrapper so horizontal scroll stays within safe-area padding.
2. **Nav.tsx** — Mobile drawer pl/pr changed from 1rem to 1.5rem to match LAYOUT.safeAreaX.
3. **discover/loading.tsx** — CardSkeleton content area uses `CARD.content` instead of `p-4`.
4. **airport/page.tsx** — Before-you-go checklist section uses `CARD.base` + `CARD.content` (+ bg override).
5. **weather/[month]/page.tsx** — "What to expect" block uses `CARD.base` + `CARD.contentLg`.
6. **plan/page.tsx** — "Removed from list" inline card uses `CARD.content`.
7. **loading.tsx** — Hero uses `LAYOUT.form`; skeleton cards use `CARD.base` + `CARD.content`.
8. **page.tsx** — Hero content wrapper uses `LAYOUT.form`.
9. **AddToItineraryButton.tsx** — "View plan →" link uses `min-h-[44px]` for touch target.
10. **SuggestedForDay.tsx** — Wrapper uses `CARD.base` + `CARD.content` with aegean overrides.
11. **install/page.tsx** — Requirements list uses `CARD.base` + `CARD.content`.
12. **design-tokens.ts** — Added `EMPTY_STATE_LARGE`; **TrailsClient.tsx** uses it for "no trails match" and CARD.base + CARD.contentLg for report-conditions callout.
13. **discover/[id]/page.tsx** — Sections now use `CARD.base` + `CARD.contentLg` with background/border overrides (removes manual base card styling).
14. **trails/[id]/page.tsx** — `SectionCard` now uses `CARD.base` + `CARD.contentLg` with border accent.
15. **events/page.tsx** — `EventCard` always uses `CARD.base` + `CARD.content`; planning tips use `CARD.base` + `CARD.contentLg`.

---

## Recommended Next Steps

- **P1:** Use `CARD.base` + `CARD.content` / `CARD.contentLg` consistently where card-like blocks are built manually (discover/[id], trails/[id], events, bookings, install, TrailsClient, SuggestedForDay, weather/[month], plan).
- **P1:** Replace ad-hoc section spacing with SECTION.headingGap and SECTION.blockGap on install, search, events, plan, bookings, admin.
- **P1:** TrailsClient empty state: either use EMPTY_STATE as-is or add EMPTY_STATE_LARGE and use it there.
- **P2:** Remove redundant `rounded-xl` when combined with CARD.base; use CARD.base for root loading skeleton cards; AddToItineraryButton "View plan →" min-height; not-found CTA padding; optional scroll-strip token.

---

## Route Layout Coverage

All page.tsx files use LAYOUT tokens (max-width + safeAreaX + pagePy/pagePyDetail). Segment layout.tsx files (events, plan, bookings, trails/[id]) are metadata/JSON-LD only; root layout is the single shell. No pages missing LAYOUT.
