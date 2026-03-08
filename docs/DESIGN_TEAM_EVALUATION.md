# Cyprus Winter — Design Team Evaluation

**Date:** March 2026  
**Reviewers:** Visual design, UX, Accessibility, Brand  
**Scope:** All pages and core components

---

## Executive Summary

The app has a strong Mediterranean identity and clear hierarchy. The design system is mostly consistent, but several refinements would improve visual cohesion, hierarchy, and polish. Priority: **fix inconsistencies first**, then **enhance hero and CTAs**, then **accessibility and micro-interactions**.

---

## 1. Visual Design (James & Kostas)

### Strengths
- **Palette** — Terracotta, olive, golden, charcoal read as Mediterranean winter; sand background is calm and distinctive
- **Typography** — Fraunces for headings and Plus Jakarta Sans for body is clear; font-display adds warmth
- **Cards** — Rounded corners (2xl), soft borders, hover states are coherent
- **Hero** — Gradient overlay, terracotta/golden blur orbs, white text on dark works well

### Gaps

| Issue | Location | Recommendation |
|-------|----------|----------------|
| **Card border inconsistency** | Home: Weather cards use `border-l-4` (golden, terracotta); Go deeper uses `border-olive/10`; Essentials uses `border-olive/10`. Mixed treatment. | Standardize: feature cards (weather, itinerary, events) = `border-l-4` accent; content cards = `border border-sand-200` |
| **Emoji as primary iconography** | Home mood pills (🥾, 🌿, 🍷, etc.), Essentials (✈️, 🥾, 🏛️, 🍷). Works but feels casual. | Accept for MVP; Phase 2 consider icon set (e.g. Lucide) for a more polished look |
| **Section spacing rhythm** | `py-8`, `py-10`, `py-12` vary. No clear rhythm. | Define: section padding `py-12` or `py-16`; subsections `py-6` or `py-8` |
| **"Go deeper" vs "Essentials" cards** | Go deeper: `hover:border-golden/50`. Essentials: `hover:border-terracotta`. Different accent. | Pick one: terracotta for primary hover, golden for "featured/insider" only |
| **Weather cards vs Quick picks** | Weather: `border-l-4 border-golden` / `border-terracotta/50`. Quick picks (Artemis, Wineries): `border-olive/10`. Visually different. | Align: both as `border border-sand-200` or give quick picks a subtle left accent |

---

## 2. UX & Hierarchy (Lena)

### Strengths
- **PageHeader** — Back link, title, description is consistent (Discover, Trails, Plan)
- **Clear CTAs** — "Book a tasting", "Trail conditions", "Plan trip" are obvious
- **Mood exploration** — Seven pills (Active, Nature, Culture, Wineries, Villages, Wellness, Plan) give clear entry points
- **Empty/error states** — Bookings, error.tsx, not-found have friendly copy and recovery paths

### Gaps

| Issue | Location | Recommendation |
|-------|----------|----------------|
| **Hero CTA hierarchy** | Four equal pill buttons (Book tasting, Trail conditions, Discover, Just arrived). AI CTA is primary but competes. | Make "Book a tasting" or "Trail conditions" visually primary (filled terracotta); others secondary (outline) |
| **Home scroll length** | Many sections: Hero, AI, Weather, Mood, Itinerary, Go deeper, Events, Essentials, Why Cyprus, CTA. Long. | Consider: collapse "Why Cyprus" into accordion or move to a /why-winter page; keep hero → weather → mood → itinerary above fold focus |
| **Plan page density** | Place picker grids have `max-h-[160px]` / `max-h-[180px]` / `max-h-[280px]` scroll. Feels cramped. | Add search/filter for attractions; or tabs (Wineries | Trails | Attractions) to reduce cognitive load |
| **Discover filter pills** | Same style for active and inactive. Active = terracotta filled. | Add `ring-2 ring-terracotta/50` or slight scale on active for clearer state |
| **Bookings page** | "Enter your email" is secondary. Users may not realize they can sync across devices. | Add a small banner: "Booked on another device? Enter your email to see all bookings." |

---

## 3. Consistency & Component Usage

### Strengths
- AttractionCard, TrailBadges, PageHeader used across pages
- Design tokens (terracotta, olive, golden) used consistently in most places

### Gaps

| Issue | Location | Recommendation |
|-------|----------|----------------|
| **Bookings page** | Does not use PageHeader; has its own back link + h1 + p. | Refactor to PageHeader for consistency |
| **Airport, Events, Team** | Likely custom headers. | Audit: use PageHeader where structure matches |
| **Back link labels** | Discover detail: "← Back to Discover". Others: "← Back". | Standardize: "← Back" or "← Back to [section]" per page type |
| **Primary button style** | Some: `bg-terracotta`. Others: `border-2 border-terracotta`. | Document: primary = filled terracotta; secondary = outline |

---

## 4. Accessibility (Lena)

### Strengths
- `focus-visible` styles in globals.css
- Mobile menu and primary buttons have min 44px touch targets
- Descriptive `alt` on images (per CONTENT_AUDIT)
- Error/not-found pages have clear headings and CTAs

### Gaps

| Issue | Location | Recommendation |
|-------|----------|----------------|
| **Section headings** | Home sections use `h2` and `h3` but no `<section aria-labelledby>`. | Add `aria-labelledby` where helpful for screen readers |
| **Mood pills** | Links with emoji only—no sr-only text. | Add `aria-label` or visible text (already have text; ensure emoji don't replace meaning) |
| **Loading states** | Plan loading.tsx has skeleton; Bookings has pulse. | Ensure `aria-busy` / `aria-live` where relevant |
| **Form labels** | Winery booking, email lookup. | Verify all inputs have associated `<label>` or `aria-label` |

---

## 5. Brand & Tone

### Strengths
- Voice is warm, conversational, practical ("The island rewards the curious", "You're one tap from the good stuff")
- "Escape the cold. Explore." tagline is memorable
- Tips and local secrets add personality

### Gaps

| Issue | Recommendation |
|-------|----------------|
| **Wellness → monastery** | "Wellness" links to monasteries. Consider if "Peace & quiet" or "Monasteries & calm" is clearer |
| **Emergency 112** | Repeated in hero, error, footer. Good. Ensure it’s in not-found too (currently missing) |

---

## 6. Mobile & Responsive

### Strengths
- Nav collapses to hamburger; touch targets 44px
- Grids use `sm:grid-cols-2 lg:grid-cols-4`
- Images use Next/Image with sizes

### Gaps

| Issue | Recommendation |
|-------|----------------|
| **Hero on small screens** | `min-h-[85vh]` may push CTAs below fold on short devices | Consider `min-h-[80vh]` or reduce hero copy on mobile |
| **Mood pills wrap** | Seven pills wrap; can feel busy on narrow screens | Consider horizontal scroll or 2-row layout on mobile |

---

## 7. Prioritized Action List

### P0 (Quick wins)
1. Add "Emergency 112 · Tourist info 1460" to not-found.tsx
2. Refactor Bookings page to use PageHeader
3. Standardize hero CTA: one primary (filled), rest secondary (outline)

### P1 (Polish)
4. Unify card hover: terracotta/30 for content cards; golden/50 only for "featured" (Go deeper)
5. Add active state emphasis to Discover filter pills (ring or scale)
6. Audit Airport, Events, Team for PageHeader usage

### P2 (Enhancement)
7. Define section spacing rhythm (py-12 / py-16) ✅
8. Plan page: consider search or tabs for place picker ✅
9. Accessibility: aria-labelledby on major sections, verify form labels

---

## 8. Files Reference

| Area | Files |
|------|-------|
| Home | `src/app/page.tsx` |
| Discover | `src/app/discover/page.tsx`, `src/app/discover/[id]/page.tsx` |
| Trails | `src/app/trails/page.tsx`, `src/app/trails/[id]/page.tsx` |
| Plan | `src/app/plan/page.tsx` |
| Bookings | `src/app/bookings/page.tsx` |
| Components | `PageHeader.tsx`, `AttractionCard.tsx`, `Nav.tsx` |
| Global | `globals.css`, `layout.tsx` |
| Error states | `error.tsx`, `not-found.tsx` |
