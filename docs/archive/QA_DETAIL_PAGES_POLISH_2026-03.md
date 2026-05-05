**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Detail Pages Polish — QA Findings & Fixes

**Date:** 2026-03-07  
**Scope:** trails/[id], discover/[id], book/winery/[id], regions/[slug], weather/[month]  
**Teams:** branding-redesign, ux-polish, content-polish, audit-explore

---

## Summary of Fixes Applied

### Typography
- **trails/[id]:** Added `prose-intro` to description; `space-y-8` → `space-y-10 sm:space-y-14`
- **discover/[id]:** Section labels `text-xs font-semibold uppercase tracking-widest` → `prose-label`; added `prose-intro` to intro; "Great for" `text-olive/60` → `text-olive/70`
- **RelatedPlacesBlock:** Heading → `prose-label`

### Layout & Background
- **discover/[id]:** `bg-background` → `bg-sand` (match trails)
- **book/winery/[id], regions/[slug], weather/[month]:** Added `min-h-screen bg-sand` to page wrapper
- **discover/loading.tsx:** `bg-background` → `bg-sand`

### Components
- **trails/[id]:** Removed redundant RelatedPlacesBlock wrapper (component already uses CARD.base)
- **regions/[slug], weather/[month]:** Event list items → `CARD.base` + `CARD.content` (replaced ad-hoc rounded-lg border p-4)

### Content & Accessibility
- **discover/[id]:** Added `aria-label="Place actions"` to footer (match trails)
- **weather/[month]:** Added "Plan your trip" link to footer; `space-y-10` → `space-y-10 sm:space-y-14`

---

## Deferred (Not Applied)

| Item | Reason |
|------|--------|
| SectionCard extraction to shared component | Bigger refactor; trails uses SectionCard, discover uses plain sections. Consider in future sprint. |
| StickyAddToPlanBar safe-area padding | Needs careful testing on notched devices. |
| Emergency number format standardization | ai-context, winter-tips, airport use different formats; requires content review. |
| Weather meta description truncation | P0 per content-polish; can add in follow-up. |
| Region meta description CTA consistency | Content-only; low risk. |
