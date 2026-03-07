# Footer & Sticky Bar Audit (Mar 2026)

## Summary

**Issue:** Duplication between StickyPlanBar "Plan your trip" CTA and BottomNav "Plan" link on mobile when both visible.

**Fixes applied:**
- **Plan CTA duplication:** Added `StickyPlanBarContext` to coordinate visibility
- When StickyPlanBar or PlanStickyAddBar is visible, BottomNav hides the "Plan" tab (invisible, keeps layout)
- PlanStickyAddBar (Plan page) now participates: when "Add place" bar is visible, Plan tab is hidden
- BottomNav uses `invisible pointer-events-none` for Plan when hidden to avoid layout shift
- **Add to plan duplication:** StickyAddToPlanBar and TrailDetailStickyActions use sentinels in the footer CTA—they only appear when the in-page "Add to plan" scrolls out of view (no double CTA)
- **Plan your trip duplication:** All StickyPlanBar / StickyPlanBarBlock pages place the sentinel at the Plan CTA (hero, footer, or "Plan your day" link) so the sticky only appears when that CTA scrolls out

## Structure

| Component | Purpose | Links/Actions |
|-----------|---------|---------------|
| **Footer** | Site footer (all viewports) | Discover, Plan, Arriving, Weather, Bookings + emergency 112/1460/199 |
| **BottomNav** | Mobile bottom bar (fixed) | Home, Discover, Trails, Weather, Plan + More (Search, Bookings, Events, Arriving) |
| **StickyPlanBar** | Appears above BottomNav on scroll | "Plan your trip" → /plan |
| **StickyAddToPlanBar** | Place detail (discover/[id]) | "Add to plan" — appears when footer CTA scrolls out |
| **TrailDetailStickyActions** | Trail detail (trails/[id]) | "Add to plan" + Report — appears when footer CTA scrolls out |
| **PlanStickyAddBar** | Plan page | "Add place" (scrolls to add section) |

## Footer consistency

- **Root layout:** Hardcoded English links
- **[locale] layout:** i18n via `t("footer.discover")`, etc.
- Both use same 5 links: Discover, Plan, Arriving, Weather, Bookings
- Emergency numbers: 112, 1460, 199 (bolded in both)
