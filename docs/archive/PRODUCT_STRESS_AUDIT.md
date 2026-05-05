**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Cyprus Winter — Product Stress Audit

**Date:** March 5, 2026  
**Scope:** Visual/design system, user flows, logic, UI/UX, ICP alignment  
**Format:** Category → Finding → Severity (P0/P1/P2) → File:Line → Recommended fix

---

## Summary

| Category | P0 | P1 | P2 |
|----------|----|----|-----|
| Visual / design system | 0 | 2 | 3 |
| User flows | 0 | 3 | 2 |
| Logic | 0 | 2 | 2 |
| UI / UX | 0 | 2 | 4 |
| ICP alignment | 0 | 0 | 2 |
| **Total** | **0** | **9** | **13** |

---

## 1. Visual / Design System

### Consistency of tokens, typography, spacing, cards, badges, CTAs

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| AttractionCard uses `rounded-md` for badges; skill/CARD pattern specifies `rounded-full text-xs px-2.5 py-1 bg-sand-100 text-olive/80` for badges/tags | P2 | AttractionCard.tsx:33–34, 56–59 | Align badge styling to design-tokens or document intentional variance for image-overlay vs. content badges |
| AttractionCard highlights use `rounded-md bg-sand-200/70`; design-tokens badge spec is `rounded-full bg-sand-100 text-olive/80` | P2 | AttractionCard.tsx:56–60 | Standardise highlight chips to match token spec or extend design-tokens for highlight variant |
| Secondary CTA pattern in skill is `border-2 border-aegean text-aegean rounded-full`; many secondary CTAs use `border border-terracotta/80 text-terracotta rounded-lg` | P2 | discover/[id]/page.tsx, error.tsx, not-found.tsx | Either align to aegean secondary pattern or document terracotta as secondary CTA when primary is also terracotta (contextual hierarchy) |
| Badge type colours in AttractionCard and TrailBadges use token-based classes (e.g. `bg-aegean/20 text-aegean`) — consistent ✓ | — | — | No change |

### Accessibility: contrast, focus states, touch targets

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| `text-white/60` and `text-white/70` on hero/charcoal backgrounds may fail WCAG AA for small text | P1 | page.tsx:38, 76; Nav.tsx | Test contrast; consider `text-white/80` minimum for body copy on dark backgrounds; keep decorative text at 70 if not essential |
| Skip link uses `-translate-y-[200%]` and only becomes visible on focus — correct pattern ✓ | — | layout.tsx:75–78 | No change |
| Focus states use `focus-visible:ring-2 focus-visible:ring-terracotta` — consistent ✓ | — | globals.css, components | No change |
| Touch targets: `min-h-[44px]` or `min-h-[48px]` used on interactive elements ✓ | — | Nav, BottomNav, CTAs | No change |

### Mobile: safe areas, responsive breakpoints, overflow

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| PlacePicker list has `max-h-[280px] sm:max-h-[320px] overflow-y-auto` — may cause scroll-within-scroll on short viewports | P1 | PlacePicker.tsx:42 | Add `overscroll-contain` (already present) and ensure `scroll-touch`; consider larger max-h on tablet breakpoint if content overflows |
| Safe area insets used consistently on main, footer, nav, BackLink ✓ | — | layout.tsx, BottomNav, etc. | No change |
| Explore-by-mood horizontal scroll on mobile: `overflow-x-auto scroll-touch` ✓ | — | page.tsx:167 | No change |

---

## 2. User Flows

### Primary: Landing → Discover → Detail → Add to Plan → Book (winery)

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| Flow is coherent: Discover → detail → "Add to my itinerary" → Plan → winery detail → "Book a tasting" ✓ | — | — | No change |
| Plan page `?add=id` processed after hydration; user may briefly see plan without the added place | P2 | plan/page.tsx:85–94 | Add a short loading/transition state or optimistic UI so user sees feedback before redirect |
| Winery booking success stores in localStorage; if Supabase is down, API still returns 200 and form shows success — user may assume winery received request when DB write failed | P1 | api/bookings/route.ts, WineryBookingForm.tsx | Log DB errors; consider surfacing "request received, confirmation pending" vs. "saved locally only" when Supabase unavailable |

### Secondary: Airport, Trails, Events, AI chat

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| Events page has no BackLink; uses PageHeader with default back to `/` ✓ | — | events/page.tsx | Optional: back to `/` is acceptable; consider "← Back" or PageHeader backHref for consistency with other hubs |
| Airport page: same pattern ✓ | — | airport/page.tsx | Same as above |
| AI chat: keyboard trap handled via Tab; Escape closes ✓ | — | AIAssistant.tsx | No change |
| Search results link to `/events` for events (no event detail page) — intentional ✓ | — | search.ts:53 | Document that events are list-only |

### Edge cases: invalid IDs, empty states, loading, error

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| `/discover/[id]` and `/trails/[id]` call `notFound()` for invalid IDs ✓ | — | discover/[id]/page.tsx:40, trails/[id]/page.tsx | No change |
| Trail report page for invalid trail ID renders "Trail not found" + BackLink instead of `notFound()` | P2 | trails/[id]/report/page.tsx:36–42 | Acceptable — friendly recovery; optionally use `notFound()` for consistency with other detail routes |
| Error and not-found pages: friendly copy, clear CTAs, emergency numbers ✓ | — | error.tsx, not-found.tsx | No change |
| Loading states: discover, trails, plan (client hydration), bookings use skeleton/aria-busy ✓ | — | loading.tsx, bookings | No change |

### Friction points: sign-up gates, form steps, dead ends

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| No sign-up gate for plan or bookings — low friction ✓ | — | — | No change |
| Account page is "Sign in coming soon" — no dead end; explains email lookup for cross-device ✓ | — | account/page.tsx | No change |
| Winery booking form: single step, clear labels, min date ✓ | — | WineryBookingForm.tsx | No change |
| Plan "Clear day" uses `confirm()` — blocking; acceptable for destructive action | P2 | plan/page.tsx:278 | Consider a small modal for consistency; not blocking |

---

## 3. Logic

### Data: attractions, trails, wineries, events — ID resolution, related places, combineWith

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| `getPlaceById` / `getAttractionById` resolve from `allPlaces` / `allAttractions` ✓ | — | data/index.ts | No change |
| `getRelatedPlaces` silently skips unknown IDs — no broken links, but "Combine your day" may show fewer items | P2 | related-places.ts:11–34 | Add a lint/test to validate combineWith IDs; or document as acceptable trade-off |
| Discover filter: `filter=nature` maps to section `beach`; homepage "Nature & coasts" links to `?filter=nature` | P1 | discover/page.tsx:22–29, page.tsx:168 | Document mapping; or add a "nature" section if content differs from beaches |
| Trails filter: no "All regions" chip — once region is set, user cannot clear it from the filter bar | P1 | trails/page.tsx:52–75 | Add an "All" chip for region or ensure "All" difficulty clears both (currently "All" returns `/trails` and clears both — OK) |

### Plan: localStorage sync, templates, add/remove, day tabs

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| localStorage key `cyprus-winter-itinerary`; templates use IDs from allPlaces — validated ✓ | — | useItinerary.ts | No change |
| `applyTemplate` uses `confirm()` — no merge option in UI; template always replaces | P2 | useItinerary.ts:123–133, plan/page.tsx | Consider "Merge" vs "Replace" in UI for power users |
| Plan "Place no longer available" when `getPlace(id)` returns undefined — good handling ✓ | — | plan/page.tsx:302–318 | No change |

### Bookings: email lookup, Supabase, email notifications

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| Email lookup merges local + API; handles errors with friendly message ✓ | — | bookings/page.tsx | No change |
| `getBookingsByEmail` uses memoryStore when Supabase unavailable; API returns in-memory data only for that server instance | P1 | lib/bookings.ts:69–84 | Document: email lookup may not show bookings from other instances in dev/memory mode |
| Guest confirmation and winery notification are fire-and-forget; failures logged but not surfaced | P2 | api/bookings/route.ts:52–63 | Consider retry or queue; document in ops runbook |

### Trail reports: submit, merge with conditions

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| Trail detail shows `latestReport` or `trailConditions`; report submission creates new report ✓ | — | trails/[id]/page.tsx, trail-reports | No change |
| Without Supabase, `getLatestReportsByTrail` returns `[]` — conditions fall back to static `trailConditions` ✓ | — | trail-reports.ts:68–79 | No change |

---

## 4. UI / UX

### Information architecture: nav, bottom nav, back links, section order

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| Nav highlights parent routes via `pathname.startsWith(href + "/")` ✓ | — | Nav.tsx:9–10 | No change |
| Bottom nav: Search, Discover, Trails, Plan, Events — Bookings and Airport in main nav only | P2 | BottomNav.tsx, Nav.tsx | Consider adding Bookings to bottom nav if it’s a core post-booking flow |
| Back links present on detail pages; list pages use PageHeader default back to `/` ✓ | — | BackLink, PageHeader | No change |
| Section order on home: Hero → Why Cyprus → Weather/Quick picks → Explore by mood → Four places → Plan/Events → CTA ✓ | — | page.tsx | No change |

### Copy: tone, clarity, ICP alignment

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| Copy is warm, understated, "winter escape" focused ✓ | — | — | No change |
| "Sixteen degrees when home is six" — strong ICP hook ✓ | — | page.tsx, metadata | No change |
| Email sync callout: "Booked on another device? Enter your email…" — clear ✓ | — | bookings/page.tsx | No change |

### Empty / loading / error states

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| Plan empty: "No places yet" with guidance ✓ | — | plan/page.tsx:284–292 | No change |
| Bookings empty: email lookup + "Browse wineries" CTA ✓ | — | bookings/page.tsx:86–124 | No change |
| Trails filter empty: "No trails match" + "Clear filters" link ✓ | — | trails/page.tsx:167–177 | No change |
| Search no results: "No results for \"…\"" with suggestion ✓ | — | SearchBar.tsx:124–126 | No change |
| Discover loading: skeleton; no explicit empty state (all sections have content) | P2 | discover/page.tsx | Add empty state if a section could theoretically have zero items |

### CTAs: hierarchy, placement, labels

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| Primary CTA (terracotta) vs secondary (border) — clear hierarchy ✓ | — | — | No change |
| Detail footer: "Add to my itinerary" is primary; "View all trails" is secondary ✓ | — | discover/[id], trails/[id] | No change |
| Winery booking: "Request booking" vs "Book on website" — clear ✓ | — | discover/[id], book/winery | No change |
| Plan "Copy itinerary" — good for users who want to share ✓ | — | plan/page.tsx | No change |

---

## 5. ICP Alignment

### Curated, trustworthy, winter-specific

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| Content emphasises winter: trail conditions, winter tips, winter events ✓ | — | — | No change |
| Tone: "We're here to help", "The island's waiting" — trustworthy ✓ | — | — | No change |
| "Curated" feel: templates, combineWith, insider tips ✓ | — | — | No change |

### Reduces overwhelm, clear next steps

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| Homepage offers clear paths: Discover, Trails, Plan, Ask AI ✓ | — | page.tsx | No change |
| Filter chips reduce cognitive load on Discover and Trails ✓ | — | discover, trails | No change |
| Hero CTA "Ask anything" + suggestions — low barrier ✓ | — | AIAssistant | No change |

### Mobile-first, low friction

| Finding | Severity | File:Line | Recommended fix |
|---------|----------|-----------|-----------------|
| Bottom nav for primary flows on mobile ✓ | — | BottomNav | No change |
| Touch targets, safe areas, responsive layout ✓ | — | — | No change |
| No account required for plan or booking — low friction ✓ | — | — | No change |
| "Nature" → beach mapping may confuse users expecting a distinct "nature" section | P2 | discover/page.tsx:28 | Add tooltip or label: "Nature & coasts (beaches)" when filter is active |

---

## 6. Quick Wins

| Fix | Effort | Impact | Status |
|-----|--------|--------|--------|
| Add "All" region chip to Trails filter | Low | P1 | ✅ Done |
| Document `filter=nature` → beach mapping | Low | P1 | ✅ Done |
| Increase body text contrast on hero (white/70 → white/80) | Low | P1 | ✅ Done |
| Add Bookings to bottom nav | Low | P1 | ✅ Done |
| Add merge option for plan templates | Medium | P2 | Pending |
| Validate combineWith IDs in CI | Medium | P2 | Pending |

---

## 7. No Critical Issues

No P0 (critical) issues were found. The product is production-ready from a stress-audit perspective. Recommended fixes focus on clarity, consistency, and minor UX refinements.
