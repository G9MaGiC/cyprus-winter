**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Cyprus Winter — Design Review Summary

**Completed:** March 2026  
**Plan:** `docs/DESIGN_PLAN.md`  
**Teams:** TEAM_DESIGN (branding-redesign, ux-polish, audit-explore)

Consolidated findings from the full page-by-page and flow-by-flow design review. Phases 0–5 complete.

---

## Quick Reference: Recurring Fixes

| Fix | Files | Change |
|-----|-------|--------|
| Touch target 40px → 44px | RelatedPlacesBlock, Plan, Bookings, SuggestedForDay, ShareLinks, Events filters, Secrets links, AI mic | `min-h-[40px]` → `min-h-[44px]` |
| Loading safe area | discover/loading, trails/[id]/loading | `px-6` → `LAYOUT.safeAreaX` |
| AI Assistant body scroll | AIAssistant.tsx | Lock `body overflow` when panel open |
| AI Assistant announcements | AIAssistant.tsx | Add `aria-live="polite"` for messages |
| Emergency line | trails/[id]/page.tsx | Add "· Ambulance 199" |
| Bookings persistence | bookings/page.tsx | Persist merged bookings to localStorage after API load |

---

## Phase 0: Design System

| Finding | Priority | Action |
|---------|----------|--------|
| Hardcoded hex in maps | Fixed | AllTrailsMap, TrailMap → use TOKENS |
| Token audit | Done | globals.css, design-tokens.ts OK |
| SKILL.md | Updated | Token table, component checklist |

---

## Phase 1: Core Pages

### Homepage
- **P1:** ShareLinks 44px; "Just landed?" touch target; "Right now" heading scale; empty events fallback
- **P2:** Card radius consistency; hero CTA hierarchy; category pills scroll hint

### Discover
- **P0:** Loading `LAYOUT.safeAreaX`
- **P1:** Empty state; loading ARIA; "All" filter chip; chip skeleton shape
- **P2:** Badge shape; back link

### Discover detail
- **P1:** RelatedPlacesBlock "Add +" 44px; loading safe area
- **P2:** Hero fallback; RelatedPlacesBlock rounded; loading skeleton match

### Trails
- **P1:** FilterChips ring-offset; map empty fallback; Report conditions touch target; Winter tips link
- **P2:** Clear all filters; map role; loading chip height; PageHeader arrow aria-hidden

### Trail detail
- **P1:** RelatedPlacesBlock "Add +" 44px; loading safe area; heading style; hero margin + safe area
- **P2:** Loading skeleton; badge ARIA; map ARIA; error boundary; hero corners

### Trail report
- **P0:** Status/Surface `role="group"` + `aria-labelledby`; success `role="status"` + `aria-live`; loading `aria-busy`
- **P1:** Note character count; focus ring; error-field association; show descriptions
- **P2:** Success visuals; focus trap; main landmark

---

## Phase 2: Conversion Flows

### Plan
- **P1:** Indicate which day item added to; scroll to new item; copy failure feedback
- **P2:** PlacePicker toggle clarity; touch targets 44px; copy CTA placement; emoji; remove feedback; Clear day undo

### Book winery
- **P1:** Focus/scroll to success; success `aria-live`; field-level validation; Modify vs blank form
- **P2:** Plan "Book" 44px; alt paths in collapsible; homepage "Book tastings" link; loading spinner; date error styling

### Bookings
- **P0:** Persist merged to localStorage; success feedback; 429 handling
- **P1:** View/Modify 44px; centralize email form; "Load by email" visibility
- **P2:** aria-busy; CTA order; label alignment; transient "X bookings loaded"

---

## Phase 3: Supporting Pages

### Events
- **P0:** Filter buttons 44px
- **P1:** loading.tsx; aria-pressed; empty aria-live; external link labels
- **P2:** CARD token; role="group"; highlight borders; mobile filter scroll

### Search
- **P0:** Dropdown vs BottomNav stacking check
- **P1:** Type badges + semantic colors; aria-live on empty states; router.push vs location.href
- **P2:** Heading/placeholder alignment; input prominence; full-page mobile; autoFocus

### Secrets
- **P1:** Duplicate back link; empty state; "Go there" and place link 44px
- **P2:** Card hierarchy; badge styling; main landmark

### Airport, Team, Account
- **P1:** Account `LAYOUT.safeAreaX`; Team empty state; Secrets (above)
- **P2:** Various consistency items

---

## Phase 4: Cross-Cutting

### Navigation
- **P1:** More menu focus management; mobile Ask AI prominence
- **P2:** role="menu"; active link styling; bottom nav icons; floating Ask AI

### AI Assistant
- **P0:** Lock body scroll when open
- **P1:** aria-live for messages; mic 44px
- **P2:** aria-expanded; backdrop; Dismiss 44px; message line-height

### Mobile & Accessibility
- **P0:** ShareLinks 44px; AI mic 44px; WineryBookingForm focus rings
- **P1:** "Just landed?" 44px; scrollIntoView reduced-motion; scroll-smooth; aria-hidden
- **P2:** Nav aria-label; contrast; FilterChips sizing

---

## Phase 5: Visual QA

### High
- Emergency line: add Ambulance 199 (trails detail)
- Discover loading: `LAYOUT.safeAreaX`
- AI mic: 44px touch target

### Medium
- Typography: standardize `text-olive/70`, `/80`, `/90`
- Tip boxes: align golden styles
- Touch targets: 40px → 44px (RelatedPlacesBlock, Plan, Bookings, SuggestedForDay)
- Footer: `text-olive/65` → `text-olive/70`

### Low
- Admin heading font-display
- Airport tip box style
- Error/not-found backgrounds

---

## Implementation Order

1. **P0 / Critical** — Body scroll lock (AI), Bookings persistence, Emergency 199, Trail report ARIA
2. **Touch targets** — Batch change `min-h-[40px]` → `min-h-[44px]` across all identified components
3. **Loading states** — `LAYOUT.safeAreaX` in discover and trail loading
4. **ARIA / accessibility** — aria-live, role="status", aria-pressed, focus management
5. **P2 / Polish** — Typography, tip boxes, card consistency

---

## Files Most Affected

| File | Changes |
|------|---------|
| RelatedPlacesBlock.tsx | min-h-[44px] on Add + |
| ShareLinks.tsx | min-h-[44px] on share buttons |
| AIAssistant.tsx | body scroll lock, aria-live, mic 44px |
| plan/page.tsx | Touch targets, copy feedback, scroll to new item |
| bookings/page.tsx | localStorage persist, success feedback, 429, touch targets |
| WineryBookingForm.tsx | Focus rings, success aria-live, field validation |
| discover/loading.tsx | LAYOUT.safeAreaX |
| trails/[id]/loading.tsx | LAYOUT.safeAreaX |
| trails/[id]/report/page.tsx | ARIA groups, success aria-live |
| trails/[id]/page.tsx | Emergency 199 |
| events/page.tsx | Filter 44px, loading.tsx, aria-pressed |
| SearchBar.tsx | Badges, aria-live, router.push |
