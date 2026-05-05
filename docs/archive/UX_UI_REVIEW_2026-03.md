**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Cyprus Winter — Complete UX/UI Review

**Date:** 2026-03-06  
**Scope:** 25 pages, 16 key components, design system, accessibility, mobile, conversion, UX persona  
**Sources:** SKILL.md, UX_PERSONA.md, PRD.md, REDESIGN_BRIEF.md, CPO_QA_REVIEW_2026-03-06.md, UI_QA_REPORT.md, UX_UI_FIX_PLAN.md

---

## Executive Summary

| Priority | Count | Status |
|----------|-------|--------|
| **P0 (blockers)** | 6 | Must fix before launch |
| **P1 (should fix)** | 18 | Fix in 1 sprint |
| **P2 (nice-to-have)** | 14 | Backlog |

**Overall:** Design system is solid; typography and tokens align with Mediterranean warmth. Critical gaps: conversion friction (Discover→Plan, Events→Plan, Search recovery), weather hub month navigation, Plan day limits, and a few accessibility/contrast items.

---

## 1. P0 — Blockers

### P0-1. Search: No-results state when input not focused
**File:** `src/components/SearchBar.tsx`  
**Issue:** No-results recovery links only appear when input is focused. If user lands on `/search?q=xyz` with no results and scrolls/blurs, the recovery links may not be visible.  
**Code suggestion:** Ensure the page-level no-results block in `src/app/search/page.tsx` (lines 39–63) is always visible when `q.length >= 2`, and that SearchBar and page block don’t conflict. Page block is already present; verify SearchBar’s `focused &&` condition doesn’t create a dead end when user never focuses.  
**Recommendation:** Page block is sufficient; ensure SearchBar no-results state also appears when `!focused` but `query.length >= 2` and `results.length === 0`—e.g. show recovery links below the input when there’s a query and no results, regardless of focus.

### P0-2. Discover: No Discover→Plan CTA above the fold at list level
**File:** `src/app/discover/page.tsx`, `src/app/discover/DiscoverClient.tsx`  
**Status:** Partially addressed. DiscoverClient has a "Plan your trip" CTA in the sticky header (lines 78–82). Verify it is visible above the fold on mobile. If FilterChips push it down, consider a more prominent placement.

### P0-3. Events: Events not addable to Plan
**File:** `src/app/events/page.tsx`  
**Status:** EventCard uses `AddToItineraryButton placeId={event.id}` (line 100). Events have `id` like `epiphany-cyprus`. Need to verify `getPlaceById` and `useItinerary` support event IDs. If events are not in `allPlaces`, the add flow will fail.  
**Code check:** `src/data/index.ts` — ensure events are in `allPlaces` or itinerary logic handles them.

### P0-4. Plan: No explicit "Book tastings" CTA when plan has wineries
**File:** `src/app/plan/page.tsx`  
**Status:** Addressed. Lines 224–247 show "You have wineries in your plan" with "Book your tastings" when `hasWineries`. Verified.

### P0-5. Trail detail: No "Book a guide" when conditions are caution/closed
**File:** `src/app/trails/[id]/page.tsx`  
**Status:** Addressed. Lines 226–244 render "Book a guide" link when status is caution or closed. Verified.

### P0-6. Weather hub: Month rows not clickable to month detail
**File:** `src/app/weather/page.tsx`  
**Lines:** 35–50  
**Issue:** Table month cells are plain text; no link to `/weather/[month]`. CPO: "Month rows not clickable to month detail."  
**Code suggestion:** Add `MONTH_TO_SLUG` map (e.g. `November`→`november`, `December`→`december`, etc.). In `weather/[month]/page.tsx`, `MONTH_SLUGS` currently includes `december`, `january`, `february`, `march`—extend to `november` and `april` if desired. Then wrap the month cell:
```tsx
const MONTH_TO_SLUG: Record<string, string> = {
  November: "november", December: "december", January: "january",
  February: "february", March: "march", April: "april",
};
// In tbody:
<td className="py-4 px-4">
  {MONTH_TO_SLUG[row.month] ? (
    <Link href={`/weather/${MONTH_TO_SLUG[row.month]}`} className="font-medium text-olive hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded min-h-[44px] inline-flex items-center">
      {row.month}
    </Link>
  ) : (
    <span className="font-medium text-olive">{row.month}</span>
  )}
</td>
```
**Note:** First add `november` and `april` to `MONTH_SLUGS` in `weather/[month]/page.tsx` if those detail pages should exist.

---

## 2. P1 — Should Fix

### P1-1. Home: No "escape the cold" / temperature contrast messaging
**File:** `src/app/page.tsx`  
**Lines:** 45–56  
**Issue:** PRD winter home screen shows "18°C Limassol · Perfect for hiking" and "Good morning, escape the cold". Current hero lacks that weather-first contrast.  
**Suggestion:** Add a small line above or below the intro, e.g. "Sixteen degrees when home is six."

### P1-2. Discover: No winery booking CTA when filter=winery
**File:** `src/app/discover/DiscoverClient.tsx`  
**Issue:** When filtered to wineries, no prominent "Book a tasting" CTA in the sticky area.  
**Suggestion:** When `filter === "winery"`, add a secondary CTA: "Book tastings" → `/bookings` or `/discover?filter=winery` with anchor to first winery card.

### P1-3. Trails: No Add to plan on TrailCard
**File:** `src/components/TrailCard.tsx`  
**Issue:** TrailCard is a single Link; no "Add to plan" on the card. Users must open trail detail to add.  
**Suggestion:** Add `AddToItineraryButton` as overlay or footer on TrailCard, or a compact "Add" icon that doesn’t compete with the main tap target.

### P1-4. Trail report: Success state has no next step
**File:** `src/app/trails/[id]/report/TrailReportClient.tsx`  
**Issue:** After successful report, user sees success message but no clear CTA (e.g. "Add to plan", "Report another trail", "Back to trails").  
**Suggestion:** Add "Add to plan" and "Report another trail" links on success.

### P1-5. Beaches, Villages: No Plan CTA in footer
**Files:** `src/app/beaches/page.tsx`, `src/app/villages/page.tsx`  
**Lines:** beaches 30–35, villages 30–35  
**Issue:** Footer links to "See all places" but not "Plan your trip".  
**Suggestion:** Add `Plan your day` or `Add to itinerary` link beside "See all places".

### P1-6. Wineries: No booking CTA above the fold
**File:** `src/app/wineries/page.tsx`  
**Issue:** PageHeader has no primary booking CTA. First CTA is in AttractionCard (Book tasting).  
**Suggestion:** Add "Book a tasting" button in PageHeader children, linking to `/bookings` or first winery booking.

### P1-7. Bookings: No "Book again" for past wineries
**File:** `src/app/bookings/page.tsx`  
**Issue:** Past bookings lack a "Book again" or "Book another tasting" CTA.  
**Suggestion:** For past winery bookings, add "Book again" linking to `/book/winery/[id]`.

### P1-8. Weather hub: Month rows not clickable (duplicate of P0-6)
See P0-6.

### P1-9. Plan: 5 days may be too few for 10-day itineraries
**File:** `src/app/plan/page.tsx`  
**Lines:** 349–376  
**Issue:** Day selector only shows Days 1–5. PRD persona "Cultural Explorer Claire" plans 10–14 days.  
**Suggestion:** Extend to 7 or 10 days, or add "Add day" to allow dynamic expansion.

### P1-10. Bottom nav: 7 items cramped at 375px
**File:** `src/components/BottomNav.tsx`  
**Lines:** 7–14  
**Issue:** 7 links (Home, Search, Discover, Trails, Plan, Bookings, Events) with `min-w-[48px]`/`min-w-[56px]` may wrap or feel cramped on iPhone SE.  
**Suggestion:** Test at 375px; consider reducing to 5 items or making labels smaller/icon-only on smallest viewports.

### P1-11. Layout footer: text-olive/65 non-standard
**File:** `src/app/layout.tsx`  
**Line:** 97  
**Issue:** `text-olive/65` is non-standard; design tokens use `olive/70`, `olive/60`.  
**Suggestion:** Use `text-olive/70` or `text-olive/60` for consistency.

### P1-12. Contrast: olive/70 on sand — verify WCAG AA
**Files:** `src/app/globals.css`, various components  
**Issue:** `text-olive/70` on `sand`/`background` may fail 4.5:1 for body text.  
**Suggestion:** Run axe or Lighthouse; if it fails, bump to `olive/80` for body text or use `text-olive` (no opacity) where legibility is critical.

### P1-13. FilterChips: Ensure role="group" aria-label
**File:** `src/components/FilterChips.tsx`  
**Status:** Addressed. Line 34: `role="group"`, line 35: `aria-label={ariaLabel}`. Default `ariaLabel="Filters"`. Verified.

### P1-14. PlacePicker empty state copy
**File:** `src/components/PlacePicker.tsx`  
**Line:** 80  
**Current:** "No matches. Try another search or category."  
**Suggestion:** Align with UX_PERSONA: "No matches for that. Try another search, or pick a different tab."

### P1-15. DiscoverClient: Validate section before "Showing {title}"
**File:** `src/app/discover/DiscoverClient.tsx`  
**Lines:** 65–77  
**Issue:** QA H3 — if `filter` maps to unknown section, `sections.find(s => s.id === filter)` could be undefined. Code uses `sectionExists` and `filter && sectionExists`, but `sections.find(...)!` could throw if filter is valid but section missing.  
**Suggestion:** Add null check before `sections.find(s => s.id === filter)!.title`.

### P1-16. Trail report: notFound() during client hydration
**File:** `src/app/trails/[id]/report/TrailReportClient.tsx`  
**Issue:** M6 — `notFound()` may run before params are resolved on client.  
**Suggestion:** Resolve params (e.g. via `useParams`) before calling `notFound()`; add loading state if needed.

### P1-17. Bookings: Invalid provider links → 404
**File:** `src/app/bookings/page.tsx`  
**Issue:** QA H1 — "View winery" / "Modify" links to provider URLs that can 404 if winery was removed.  
**Suggestion:** Validate `providerId` against existing places before rendering links; hide or disable if invalid.

### P1-18. Plan ?add= trail slugs
**File:** `src/data/index.ts`, `src/hooks/useItinerary.ts`  
**Issue:** QA H2 — `getPlaceById` may not resolve trail slugs; `/plan?add=artemis` might fail if ID is `artemis` but data uses different key.  
**Suggestion:** Extend `getPlaceById` to resolve trail slugs, or document that share URLs must use canonical IDs.

---

## 3. P2 — Nice-to-have

### P2-1. Design token: CARD.featured for rounded-2xl
**File:** `src/lib/design-tokens.ts`  
**Suggestion:** Add `CARD.featured = "rounded-2xl ..."` for hero/featured cards to standardise.

### P2-2. Section padding rhythm
**Files:** `page.tsx`, various hub pages  
**Issue:** Homepage uses `SECTION.py`; some pages use `py-12 sm:py-16`. Document when to use which.

### P2-3. AttractionCard badges: rounded-md vs rounded-full
**File:** `src/components/AttractionCard.tsx`  
**Line:** 42  
**Current:** `rounded-md`. Skill mentions `rounded-full` as acceptable. Optional alignment.

### P2-4. Loading skeletons vs final content layout
**Files:** `discover/loading.tsx`, `trails/loading.tsx`, `bookings/loading.tsx`  
**Suggestion:** Ensure skeleton structure matches final content to avoid layout shift.

### P2-5. Weather table: Mobile scroll UX
**File:** `src/app/weather/page.tsx`  
**Issue:** `min-w-[600px]` forces horizontal scroll; consider card layout on mobile.

### P2-6. AddToItineraryButton "View plan" link touch target
**File:** `src/components/AddToItineraryButton.tsx`  
**Lines:** 42–46  
**Issue:** "View plan →" link may be small on mobile.  
**Suggestion:** Ensure adequate padding; consider full-width tap area.

### P2-7. Secrets page: No Plan CTA
**File:** `src/app/secrets/page.tsx`  
**Suggestion:** Add "Plan your trip" or "Add to itinerary" in footer or after grid.

### P2-8. Airport page: Card border consistency
**File:** `src/app/airport/page.tsx`  
**Issue:** Use CARD tokens consistently; verify against design-tokens.

### P2-9. Hero emergency line contrast
**File:** `src/app/page.tsx`  
**Issue:** Footer uses `text-white/70`; consider `text-white/80` for better contrast on dark gradient.

### P2-10. StickyAddToPlanBar: Overlap with BottomNav
**File:** `src/components/StickyAddToPlanBar.tsx`  
**Line:** 41  
**Status:** Uses `bottom-[calc(4.5rem+env(safe-area-inset-bottom))]` to clear BottomNav. Verify no overlap on all devices.

### P2-11. AIAssistant: Reduce motion for bounce animation
**File:** `src/components/AIAssistant.tsx`  
**Lines:** 356–360  
**Suggestion:** Respect `prefers-reduced-motion` for loading dots animation.

### P2-12. Nav More menu: Keyboard focus trap
**File:** `src/components/Nav.tsx`  
**Issue:** When More menu is open, focus should be trapped. Escape closes it (lines 31–39). Arrow-key navigation within menu would improve accessibility.

### P2-13. Footer links: Minimum touch target
**File:** `src/app/layout.tsx`  
**Lines:** 89–94  
**Issue:** Links have `hover:` and `focus-visible:` but no explicit `min-h-[44px]`.  
**Suggestion:** Add `min-h-[44px] inline-flex items-center` for footer nav links.

### P2-14. Mood/category chips: Ensure no double-primary
**File:** `src/app/page.tsx`  
**Lines:** 106–124  
**Status:** Villages and Wineries use chipPrimary; Trails, Events, All use chipSecondary. Hierarchy is clear. No change needed unless UX requires adjustment.

---

## 4. Accessibility Audit

| Criterion | Status | Notes |
|-----------|--------|------|
| Semantic HTML | ✓ | Main, nav, section, article, header, footer used appropriately |
| Skip link | ✓ | layout.tsx line 77–81, targets #main-content |
| Focus visible | ✓ | globals.css `*:focus-visible` + component-level rings |
| Touch targets 44px | ✓ | Most CTAs use min-h-[44px] or min-h-[48px] |
| aria-labelledby on sections | ✓ | Home, Discover, Trails, Plan, Events use it |
| Form labels | ✓ | BookingsEmailLookup, WineryBookingForm have labels/aria-label |
| Loading aria | ✓ | Plan loading, AIAssistant use aria-busy, aria-live |
| Modal focus trap | ✓ | AIAssistant implements Tab trap |
| Reduced motion | ✓ | globals.css prefers-reduced-motion media query |
| Contrast | ⚠ | Verify olive/70 on sand; footer text-olive/65 |

---

## 5. Mobile Audit (375px)

| Item | Status |
|------|--------|
| Safe areas | ✓ pl/env(safe-area-inset-*), pb for BottomNav |
| Bottom nav fit | ⚠ P1-10 — 7 items may be cramped |
| Horizontal scroll (mood pills, filters) | ✓ overflow-x-auto scroll-touch |
| Touch targets | ✓ 44px min on primary actions |
| Sticky header/nav | ✓ Nav fixed; Discover/Trails filters sticky |
| Weather table | ⚠ min-w-[600px] forces scroll |
| Layout shift | ⚠ Loading skeletons—verify match content |

---

## 6. Conversion Friction (CPO Alignment)

| Flow | Status | Action |
|------|--------|-------|
| Discover → Plan | Partial | CTA in DiscoverClient; ensure above fold |
| Events → Plan | ✓ | AddToItineraryButton on each event |
| Search no-results | Partial | Recovery links in SearchBar + page; verify visibility |
| Plan → Book tastings | ✓ | hasWineries block with "Book your tastings" |
| Trail caution/closed → Book guide | ✓ | "Book a guide" link |
| Beaches/Villages → Plan | Missing | Add Plan CTA (P1-5) |
| Wineries → Book | Partial | AttractionCard has "Book tasting"; add header CTA (P1-6) |

---

## 7. UX Persona Alignment

**Lens:** "Does this feel like Cyprus Winter — understated, warm, premium, discovery not hustle?"

| Aspect | Assessment |
|--------|------------|
| Typography & whitespace | ✓ Font-display (Fraunces), prose scale, generous spacing |
| Calm confidence | ✓ Terracotta/golden CTAs, no neon or FOMO |
| Discovery-first | ✓ Suggest, don't push; "Pair with…", "Or ask the AI" |
| Mediterranean warmth | ✓ Sand, terracotta, olive, aegean palette |
| 44px touch targets | ✓ Applied consistently |
| No emojis in primary UI | ✓ Minimal; optional in chips |
| Voice & tone | ✓ Short, warm ("Sixteen degrees when home is six") |
| Empty/error states | ✓ Friendly, recoverable ("Try again or tap Ask AI") |

**Minor:** Some pages could lean more into "escape the cold" (P1-1). Overall persona alignment is strong.

---

## 8. Design System Compliance

| Token | Usage |
|-------|-------|
| CARD.base, CARD.hover, CARD.link | ✓ AttractionCard, TrailCard, Plan, Events |
| LAYOUT.safeAreaX, list, detail, form | ✓ Applied across pages |
| SECTION.py, pySub, blockGap | ✓ Hub pages |
| TOKENS (terracotta, aegean, sage) | ✓ Inline styles (Leaflet) via design-tokens |
| Typography (prose-intro, prose-label, font-display) | ✓ Consistent |

**Drift:** `text-olive/65` in layout; some cards use `rounded-2xl` without token. Document or add CARD.featured.

---

## 9. Files Reference

| Area | Files |
|------|-------|
| Design system | `src/app/globals.css`, `src/lib/design-tokens.ts` |
| Layout | `src/app/layout.tsx` |
| Home | `src/app/page.tsx` |
| Discover | `src/app/discover/page.tsx`, `DiscoverClient.tsx`, `[id]/page.tsx` |
| Trails | `src/app/trails/page.tsx`, `TrailsClient.tsx`, `[id]/page.tsx`, `[id]/report/` |
| Plan | `src/app/plan/page.tsx` |
| Search | `src/app/search/page.tsx`, `SearchBar.tsx` |
| Events | `src/app/events/page.tsx` |
| Bookings | `src/app/bookings/page.tsx`, `BookingsEmailLookup.tsx` |
| Components | `Nav.tsx`, `BottomNav.tsx`, `PageHeader.tsx`, `AttractionCard.tsx`, `TrailCard.tsx`, `FilterChips.tsx`, `PlacePicker.tsx`, `AIAssistant.tsx`, `AIAssistantTrigger.tsx`, `AddToItineraryButton.tsx`, `StickyAddToPlanBar.tsx`, `TrailMapClient.tsx`, `AllTrailsMapClient.tsx` |
| Error states | `src/app/error.tsx`, `src/app/not-found.tsx` |

---

## 10. Prioritized Action List

### Before launch (P0)
1. Weather hub: Make month rows clickable to `/weather/[month]`.
2. Verify Search no-results always shows recovery links (page + SearchBar).
3. Verify Events add-to-Plan flow (event IDs in allPlaces).
4. Confirm Discover "Plan your trip" is above fold on mobile.

### Sprint 1 (P1)
5. Home: Add "escape the cold" temperature contrast.
6. Discover: Winery booking CTA when filter=winery.
7. TrailCard: Add "Add to plan" (compact).
8. Trail report: Add success CTAs.
9. Beaches, Villages: Add Plan CTA in footer.
10. Wineries: Add booking CTA above fold.
11. Bookings: "Book again" for past wineries.
12. Plan: Consider 7–10 days for long itineraries.
13. Bottom nav: Test 375px; reduce items or sizing if needed.
14. Fix text-olive/65 → text-olive/70.
15. Run contrast audit (olive/70 on sand).
16. PlacePicker empty copy alignment.
17. DiscoverClient section null check.
18. Trail report hydration / notFound timing.
19. Bookings provider link validation.
20. getPlaceById trail slug resolution.

### Backlog (P2)
21–34. Per P2 list above.

---

*Review completed 2026-03-06. Cross-referenced with PRD, CPO QA, UI QA, and UX_UI_FIX_PLAN.*
