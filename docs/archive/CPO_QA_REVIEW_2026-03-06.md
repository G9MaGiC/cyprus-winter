**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# CPO + QA Review — Cyprus Winter Main Pages

**Date:** 2026-03-06  
**Scope:** 23 main pages, top to bottom  
**Teams:** UX Polish + Content Polish (CPO lens) | Bug-Fix + Audit-Explore (QA lens)

---

## Executive Summary

| Lens | Critical/P0 | High/P1 | Medium/P2 | Low |
|------|-------------|---------|-----------|-----|
| **CPO** | 8 | 14 | 12 | — |
| **QA** | 0 | 3 | 6 | 5 |

**Key themes:**
- **Conversion gaps:** Discover→Plan, Events→Plan, Plan→Book tastings, Search no-results dead end
- **QA risks:** Invalid booking provider IDs, trail slugs in Plan `?add=`, design token drift
- **Cross-cutting:** CPO friction on Plan/Book aligns with QA H1 (bookings provider links); Search dead-end is both P0 and UX

---

## 1. CPO Findings (Product & UX)

### P0 — Must Fix Before Launch

| # | Page | Finding | File(s) |
|---|------|---------|---------|
| 1 | Discover | No Discover→Plan CTA at list level | `discover/page.tsx`, `DiscoverClient.tsx` |
| 2 | Events | Events not addable to Plan; no Plan CTA | `events/page.tsx` |
| 3 | Plan | No explicit "Book tastings" CTA when plan has wineries | `plan/page.tsx` |
| 4 | Search | No-results state is dead end—no recovery links | `search/page.tsx`, `SearchBar.tsx` |
| 5 | Trail detail | No "Book a guide" CTA when conditions are caution/closed | `trails/[id]/page.tsx` |
| 6 | Weather month | Event items not clickable (no link to Events) | `weather/[month]/page.tsx` |

### P1 — Fix in 1 Sprint

- **Home:** No "escape the cold" / temperature contrast messaging
- **Discover:** No winery booking CTA when `filter=winery`
- **Discover detail:** CTA copy inconsistency; ancient sites lack guided tour CTAs
- **Trails:** No Add to plan on TrailCard
- **Trail report:** Success state has no next step
- **Beaches, Villages:** No Plan CTA in footer
- **Wineries:** No booking CTA above the fold
- **Bookings:** No "Book again" for past wineries
- **Weather:** Month rows not clickable to month detail
- **Plan:** 5 days may be too few for Claire’s 10-day itineraries

### P2 — Polish / Backlog

- Smaller UX tweaks, copy polish, sticky bar overlap checks
- Install page excluded from user-facing review

### CPO Cross-Cutting Recommendations

1. **Plan as hub:** Add "Plan your trip" on Discover list, Beaches, Villages, Secrets
2. **Book flow:** Surface "Book a tasting" from Home, Discover, Plan, Wineries
3. **Search recovery:** Always show Discover / Trails / Plan links when no results
4. **Events:** Make events addable to Plan; link event mentions to Events
5. **Guides:** Add "Book a guide" on trail detail when conditions are caution/closed

---

## 2. QA Findings (Functional & Visual)

### Critical

*None.*

### High

| ID | Issue | File(s) | Reproduction |
|----|-------|---------|--------------|
| H1 | Bookings links to invalid provider → 404 | `bookings/page.tsx:295-326, 353-364` | Remove winery from data after booking; click "View winery" or "Modify" |
| H2 | `getPlaceById` does not resolve trail slugs; Plan `?add=` may fail | `data/index.ts:50`, `useItinerary.ts`, `plan/page.tsx:59-68` | Open `/plan?add=<trail-slug>` when id ≠ slug |
| H3 | DiscoverClient could show raw filter for unknown `?filter=` | `DiscoverClient.tsx:11-19, 61-64` | Validate section exists before "Showing {title}"; future mapping changes |

### Medium

| ID | Issue | Files |
|----|-------|-------|
| M1 | Card/border design token inconsistency | `airport/page.tsx`, `regions/[slug]/page.tsx`, `weather/[month]/page.tsx`, `BookingsEmailLookup.tsx` |
| M2 | Page padding mismatch across list pages | Discover, Plan, Bookings, Airport, Regions |
| M3 | Tip/callout box styles differ (golden vs aegean) | Multiple pages |
| M4 | Footer emergency numbers vs design pattern | `layout.tsx:94` |
| M5 | PlacePicker empty copy vs QA_PLAN | `PlacePicker.tsx:74` |
| M6 | Trail report: `notFound()` during initial client hydration | `TrailReportClient.tsx:39` |

### Low

| ID | Issue | File |
|----|-------|------|
| L1 | `text-olive/65` non-standard opacity | `layout.tsx:97` |
| L2 | Loading skeleton layout may not match final content | `discover/loading.tsx`, `trails/loading.tsx`, `bookings/loading.tsx` |
| L3 | Nav/BottomNav Search placement | Intentional |
| L4 | `combineWith` orphan IDs | `related-places.ts` |
| L5 | CARD hover vs other card hovers | PlacePicker, RelatedPlacesBlock, Events |

### QA Verified Behaviors

- Invalid attraction/trail/winery/region/wine-route IDs → `notFound()`
- Plan `?add=` invalid id → router replaces to /plan, no add
- Nav parent-route active (pathname.startsWith)
- Skip link targets `#main-content`
- Error/not-found pages use emergency numbers, design-aligned
- RelatedPlacesBlock skips unknown IDs

---

## 3. Cross-References (CPO ↔ QA)

| CPO Finding | QA Finding | Action |
|-------------|------------|--------|
| Bookings "Modify" / "View winery" | H1: Invalid provider links → 404 | Add validation; hide/disable links when providerId invalid |
| Plan `?add=` trail slugs | H2: getPlaceById doesn't resolve slugs | Extend getPlaceById or use canonical IDs in share URLs |
| Search dead end | — | Add Discover, Trails, Plan links to no-results state |
| Trail report success state | M6: notFound() on hydration | Add params resolution before notFound(); improve success CTA |

---

## 4. Prioritized Action List

### Before Launch (P0 / Critical)

1. **Search:** Add "Browse Discover", "View all trails", "Plan your trip" to no-results state
2. **Discover:** Add "Plan your trip" or "Add to itinerary" CTA above/below sections
3. **Events:** Add Plan CTA; make events addable to Plan
4. **Plan:** Surface "Book tastings" when wineries in plan (before first booking)
5. **Trail detail:** Add "Book a guide" when conditions caution/closed
6. **Weather month:** Link event items to `/events` or event anchors

### Sprint 1 (P1 / High)

7. **QA H1:** Validate booking providerId; hide/disable links when invalid
8. **QA H2:** Extend getPlaceById for trail slugs, or document canonical ID usage
9. **QA H3:** Validate section exists before "Showing {title}" in Discover
10. Home: Add "escape the cold" temp contrast
11. Discover: Add winery booking CTA when filter=winery
12. Trails: Add "Add to plan" on TrailCard
13. Trail report: Add "Add to plan" or "Report another" on success
14. Beaches, Villages: Add Plan CTA in footer
15. Wineries: Add booking CTA above fold
16. Bookings: Add "Book again" for past wineries
17. Weather: Make month rows clickable to `/weather/[month]`

### Backlog (P2 / Medium–Low)

- Design token alignment (M1, M3, M4, L1, L5)
- Page padding standardization (M2)
- PlacePicker copy alignment (M5)
- Trail report hydration (M6)
- Loading skeleton improvements (L2)
- Install page: N/A for product review

---

## 5. Source Documents

- **CPO:** [docs/CPO_PRODUCT_REVIEW.md](CPO_PRODUCT_REVIEW.md)
- **QA:** Subagent output (bug-fix + audit-explore)
- **Context:** PRD.md, QA_PLAN.md, TEAM_VISUAL_QA.md, .cursor/skills/cyprus-tourism-app/SKILL.md
