# Plan Page — Mobile-First UX Improvements

**Status:** P0–P2 implemented. Refinements (Mar 2026): LESS — minimal, Mediterranean warmth, sliders.

**Context:** `/plan` is well designed but felt desktop-first. Users on mobile encounter layout and hierarchy that prioritizes desktop patterns.

---

## Current Issues

### 1. Hero is heavy before primary action

On mobile, users see:
- Title + description
- Stats (places, days) + progress bar (when hasContent)
- Step indicators (only checkmarks on mobile — labels `hidden sm:inline`)
- Copy/Share row
- "Pick a template or add your first place" CTA

The primary action (pick template / add place) sits below a lot of chrome. Mobile-first would put the main CTA higher.

### 2. Sticky day selector competes for viewport

When `hasContent`, the day selector is sticky. On mobile:
- Nav bar: ~3.5rem
- Day selector: ~4rem (tabs + optional details)
- BottomNav: ~4.5rem
- PlanStickyAddBar (when shown): ~4rem

That leaves limited space for the itinerary. The day tabs are useful but sticky + compact viewport = content feels squeezed.

### 3. Template grid is vertical on mobile

`grid sm:grid-cols-3` → single column on mobile. Five template cards stack. Users must scroll before seeing "Browse all places". A mobile-first layout might surface 2–3 templates in a row (carousel or compact row) so the primary choice is above the fold.

### 4. "Add to Day N" chips wrap heavily

The quick-add chips (Artemis, Kourion, etc.) + "Browse wineries" + "What's on" in one flex row. On narrow screens they wrap into multiple rows, pushing templates down.

### 5. PlacePicker list height

`max-h-[320px]` for the place list. On mobile this can feel restrictive. Consider `min-h` for touch scroll ergonomics and slightly taller `max-h` on small screens.

### 6. Bottom spacing when PlanStickyAddBar is visible

The plan content area needs padding so the last cards and "Browse all" summary aren’t obscured by PlanStickyAddBar + BottomNav. Verify `pb-` values.

---

## Recommended Changes (Prioritized)

| Priority | Change | File |
|----------|--------|------|
| **P0** | Move primary CTA ("Pick a template or add your first place") above stats/ Copy when empty | `plan/page.tsx` |
| **P0** | On mobile, make day selector non-sticky or more compact so content has more room | `plan/page.tsx` |
| **P1** | Empty state: show 2–3 templates in a horizontal scroll row on mobile, then "Browse all" CTA | `plan/page.tsx` |
| **P1** | Reduce hero padding/space on mobile so primary action is above the fold | `plan/page.tsx` |
| **P2** | PlacePicker: increase max-h on mobile (e.g. 360px) for better scroll | `PlacePicker.tsx` |
| **P2** | Add bottom padding to plan content when PlanStickyAddBar is shown | `plan/page.tsx` |

---

## Implementation Notes

- **Sticky day selector:** Use `sticky` only from `sm:` up. On mobile, day tabs stay in flow so content gets more room.
- **Template row on mobile:** `flex overflow-x-auto snap-x gap-3` for templates on mobile instead of `grid`.
- **Primary CTA order:** When `!hasContent`, render the CTA button or template strip before the stats block.

---

## Mar 2026 Refinements (1000% UX — LESS)

### Summary

- **Less is more:** Reduced visual noise, simpler hero, one primary CTA, fewer sections, less copy.
- **Sliders/carousels:** Day selector, templates, and quick-add pills use horizontal scroll with snap on mobile.
- **Mobile-first:** Primary CTA above fold; day tabs compact; more room for itinerary content.

### Changes

| Component | Change |
|-----------|--------|
| **plan/page.tsx** | Shorter hero copy; compact trip-countdown strip; winery tip → inline links; tighter block spacing (`space-y-8 sm:space-y-10`); condensed footer tip. |
| **DaySelector** | Compact tabs (`min-w-[3.5rem]` mobile); `snap-center` for slider feel; "View all days" details hidden on mobile; less vertical padding. |
| **QuickStartSection** | Less copy; quick-add pills → horizontal scroll with snap; templates → horizontal carousel on mobile (`w-[85vw] max-w-[280px]`), grid on sm+; template cards trim (no preview/seasonal/booking lines). |
| **DayContentPanel** | Simpler empty state (no icon, shorter copy, fewer CTAs); quick-add pills → horizontal scroll on mobile; shorter labels. |

### Design Tokens & Accessibility

- 44px touch targets preserved (PILL.base, CTA, buttons).
- Focus-visible rings, ARIA labels unchanged.
- Semantic HTML and tablist/tabpanel roles preserved.
