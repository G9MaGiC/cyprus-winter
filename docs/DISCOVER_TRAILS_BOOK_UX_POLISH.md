# Discover, Trails & Book Winery — UX Polish Summary

**Date:** March 2026  
**Plan:** `.cursor/plans/discover_trails_book_ux_polish_44710373.plan.md`

## Summary

Implemented P1–P2 actions from ux-polish and content-polish team reviews for Discover, Trails, and Book winery flows. Also incorporated known UX_UI_REVIEW items (P0-2, P1-2, P1-3, P1-4).

---

## Discover

### Layout & structure
- Sticky filter bar: `top-[calc(3.5rem+env(safe-area-inset-top))]` on mobile to sit below Nav
- Added `overflow-x-hidden` on page wrapper
- Filter chips: "All" → "All categories", snap-x on mobile, ring-offset-sand for focus
- RelatedPlacesBlock "Add +" → "Add to plan" with min-w/min-h 44px and aria-label

### Content & messaging
- Meta title: "Eat" → "Restaurants"
- Hero subcopy: added "Sixteen degrees when home is six" for winter positioning
- Footer: "…in winter" for seasonal clarity
- Empty state: "Nothing in this category yet. Switch filters or ask the AI—it knows Troodos to coast."
- Detail footer CTA: "Add this place to your plan…"

### P1 (UX_UI_REVIEW)
- Discover→Plan CTA: StickyPlanBar + in-page CTAs; filter bar positioning adjusted
- "Book tastings" CTA when `filter=winery` in sticky area

---

## Trails

### Layout & structure
- TrailCard: added AddToItineraryButton for "Add to plan" (card structure: div wrapper, Link + Add button)
- Trail report success: checkmark icon, focus moved to success block
- Report CTA guard when `filtered` is empty

### Content & messaging
- Hero: "Akamas" → "Ayia Napa" to match filter regions
- Success state: "Hikers heading to {region} will use this. Every report counts."
- Success CTA: "Add {trail.name} to your plan"
- "No report yet" → "No report yet—be the first"
- Trail detail no-conditions: "Just back? Share what you saw—it takes a minute."
- Conditions CTA: "Share what you saw" (unified label)
- Footer: "Build your day → add trails to your plan"

### P1 (UX_UI_REVIEW)
- Add to plan on TrailCard
- Trail report success: next-step CTAs (Back to trail, Add to plan, Report another)

---

## Book winery

### Form & UX
- Error: scroll into view on setError; friendlier fallback copy
- Loading: spinner on submit button
- Success: focus moved to success block for screen readers
- Alternate paths: section "Other ways to book", clearer micro-copy
- Touch targets: px-3, rounded-md on alternate links
- Form labels: "Preferred date", "Group size"
- Input limits: maxLength 200 (name), 500 (notes)
- Notes placeholder: warmer, Mediterranean tone

### Content & messaging
- Intro: "Winter tastings here are cosy — fire, heaters… Send your request and they'll confirm by email."
- "Or book on website" → "…they often have more availability"
- "Or call" → "…to reserve or check availability — they're usually happy to help"
- Error fallback: "Something went wrong — check your connection and try again"
- Notes helper: "Just mention it — wineries are used to it" (no repetition)
- Success message: shortened, removed redundant call hint
- Footer hint: simplified to "The winery will confirm by email"

---

## Files changed

| Area | Files |
|------|-------|
| Discover | discover/page.tsx, DiscoverClient.tsx, discover/[id]/page.tsx |
| Trails | TrailCard.tsx, TrailsClient.tsx, trails/[id]/page.tsx, trails/[id]/report/TrailReportClient.tsx |
| Book winery | book/winery/[id]/page.tsx, WineryBookingForm.tsx |
| Shared | FilterChips.tsx, RelatedPlacesBlock.tsx |
