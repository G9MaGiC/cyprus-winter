# Cyprus Winter — UX/UI Fix Plan

**Date:** March 2026  
**Scope:** Full UX/UI improvement across all pages and components  
**Sources:** UX_PERSONA, DESIGN_TEAM_EVALUATION, DESIGNER_REVIEW, 2026 travel app research, WCAG 2.5.8, web.dev

---

## 1. Research & Best Practices (2026)

### Travel App UX

| Finding | Source | Application |
|---------|--------|-------------|
| **80% of travelers use mobile** for bookings, itinerary planning, alerts | JPLoft, OneWebCare | Mobile-first, thumb-zone, large tap targets |
| **Time-to-Value (TTV)** — users expect clarity in seconds | Mobile App UI Trends 2026 | Reduce scroll length, above-fold focus |
| **AI is expected, not differentiator** | LetsGroto | Keep Ask AI prominent; integrate naturally |
| **One-handed use** — large tap targets, generous spacing | Anything.com | 48px minimum (web.dev); Cyprus uses 44px — acceptable, consider 48px for critical CTAs |
| **Friction kills conversion** — minimize steps, smart defaults | OneWebCare | Booking flow, email lookup UX |
| **Progressive enhancement** for spotty airport WiFi | OneWebCare | Loading states, error recovery, offline hints |

### Accessibility (WCAG)

| Criterion | Requirement | Cyprus Status |
|-----------|-------------|---------------|
| **2.5.8 Target size** | Min 24×24px; best practice 48×48px for touch | Most targets 44px — good |
| **Touch spacing** | 8px between targets | Check filter chips, mood pills |
| **Contrast** | 4.5:1 text, 3:1 large text | Theme colors — verify olive/70 on sand |
| **Focus visible** | Clear focus ring | globals.css — done |
| **Section labels** | aria-labelledby for major sections | Partial — home has some, audit needed |
| **Form labels** | All inputs have label or aria-label | Bookings, winery form — verify |
| **Loading / live regions** | aria-busy, aria-live where relevant | Bookings has aria-busy — extend to Plan, search |

### Design Principles (UX_PERSONA)

- **Calm confidence** — CTAs without screaming
- **Discovery-first** — Suggest, don't push
- **Clarity** — User knows where they are
- **Generous space** — Let content breathe
- **44px touch targets** — No compromise (align with 48px best practice for critical CTAs)
- **Mediterranean warmth** — Editorial, not app-style

---

## 2. Current State Audit

### Strengths (Keep)

- Mediterranean palette (terracotta, olive, golden, sage)
- PageHeader pattern (back link, title, description)
- Focus-visible styles in globals.css
- Skip link, semantic HTML
- AttractionCard, TrailBadges, FilterChips
- Empty/error states have friendly copy and recovery paths
- Not-found has emergency 112 (added)
- Bookings uses PageHeader

### Gaps (From DESIGN_TEAM_EVALUATION)

| Area | Issue | Severity |
|------|-------|----------|
| **Hero CTA** | Four equal pills compete; AI primary but others not clearly secondary | P1 |
| **Home scroll** | Long: Hero, AI, Weather, Mood, Itinerary, Go deeper, Events, Essentials, Why Cyprus, CTA | P2 |
| **Plan page** | Place picker grids feel cramped; max-h scroll | P1 |
| **Discover filters** | Active chip needs stronger visual emphasis (ring/scale) | P1 |
| **Bookings** | "Enter your email" secondary — users may not realize they can sync | P1 |
| **Card consistency** | Weather vs Quick picks vs Go deeper use different border styles | P2 |
| **Section spacing** | py-8, py-10, py-12 vary — no clear rhythm | P2 |
| **aria-labelledby** | Major sections missing | P1 |
| **Mood pills** | Emoji-only links — ensure sr-only or visible text conveys meaning | P2 |
| **Wellness label** | Links to monasteries; "Peace & quiet" may be clearer | P2 |
| **Back link labels** | Inconsistent: "← Back" vs "← Back to Discover" | P2 |

---

## 3. Prioritized Action Plan

### P0 — Quick Wins (Do First)

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 1 | **Hero CTA hierarchy** | `page.tsx` | Make "Discover" primary (filled terracotta); Trail conditions, Book tasting, Just arrived as secondary (outline or link style) |
| 2 | **Discover filter active state** | `FilterChips.tsx` | Add `ring-2 ring-terracotta/50 ring-offset-2` or subtle scale (1.02) for active chip |
| 3 | **Bookings email banner** | `bookings/page.tsx` | Add small banner above form: "Booked on another device? Enter your email to see all bookings." |
| 4 | **aria-labelledby on sections** | `page.tsx`, `discover/page.tsx`, `trails/page.tsx` | Add `aria-labelledby="{section-id}"` to `<section>` where h2 id exists |

### P1 — Polish (Next)

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 5 | **Card border consistency** | `page.tsx` | Standardize: weather/quick picks = `border-l-4 border-l-terracotta/30`; Go deeper/Essentials = same or unified |
| 6 | **Plan place picker UX** | `plan/page.tsx`, `PlacePicker.tsx` | Add search/filter for attractions, or tabs (Wineries \| Trails \| All) to reduce cognitive load |
| 7 | **Touch target audit** | All interactive elements | Ensure 44px min; consider 48px for primary CTAs (Book, Add to plan, Ask AI) |
| 8 | **Form label verification** | `WineryBookingForm.tsx`, `bookings/page.tsx` | Confirm all inputs have associated label or aria-label |
| 9 | **Loading aria** | `plan/loading.tsx`, search | Add aria-busy, aria-live="polite" where loading affects content |
| 10 | **Back link consistency** | `PageHeader.tsx`, detail pages | Standardize: "← Back" for list, "← Back to {section}" for detail (or document as intentional) |

### P2 — Enhancement (Later)

| # | Task | File(s) | Details |
|---|------|---------|---------|
| 11 | **Home scroll optimization** | `page.tsx` | Collapse "Why Cyprus" into accordion or move to /why-winter; keep hero → weather → mood → itinerary above fold |
| 12 | **Section spacing rhythm** | design-tokens, pages | Define: section py-12 or py-16; subsections py-6 or py-8 |
| 13 | **Mood pill accessibility** | `page.tsx` | Ensure each pill has aria-label or visible text; emoji is decorative |
| 14 | **Wellness label** | `page.tsx` | Consider "Peace & quiet" or "Monasteries & calm" instead of "Wellness" |
| 15 | **Icon set** | Phase 2 | Replace emoji (Essentials, mood) with Lucide or similar for polished look |
| 16 | **Contrast audit** | globals.css, components | Verify olive/70, olive/60 on sand meet 4.5:1 (or 3:1 for large) |

---

## 4. Detailed Recommendations

### 4.1 Hero CTA Hierarchy

**Current:** Discover (filled), Trail/Book/Just arrived (links). AI trigger competes.

**Recommendation:**
- Keep AI trigger as primary (golden button) — already distinct
- "Discover" = primary secondary (filled terracotta)
- Trail conditions, Book a tasting, Just arrived = tertiary (underline links, smaller)
- Ensure one clear "start here" path: AI or Discover

### 4.2 Filter Chips Active State

**Current:** Active = `bg-olive/90 text-white`. Inactive = `bg-sand-200/80 text-olive/80`.

**Recommendation:**
```tsx
activeClassName="bg-olive/90 text-white ring-2 ring-terracotta/50 ring-offset-2 ring-offset-background"
```
Or add `scale-[1.02]` for subtle emphasis.

### 4.3 Bookings Email Banner

**Current:** "Enter your email" appears in empty state and footer. Users may miss it.

**Recommendation:** Add a dismissible or persistent banner at top: "Booked on another device? Enter your email below to see all your bookings." — links to #email-lookup or scrolls to form.

### 4.4 Section aria-labelledby

**Pattern:**
```tsx
<section aria-labelledby="why-cyprus">
  <h2 id="why-cyprus">Why Cyprus in winter</h2>
  ...
</section>
```
Apply to: Home (why-cyprus, explore-by-mood, weather, go-deeper, essentials), Discover sections, Trails sections.

### 4.5 Plan Place Picker

**Current:** Grids with max-h-[160px] to max-h-[280px] scroll; no search.

**Recommendation:**
- Add a search input that filters places by name
- Or tabs: "Wineries" | "Trails" | "All" to reduce initial options
- Consider accordion per category instead of scroll

### 4.6 Touch Targets

**Audit list:**
- Nav links, More button, Ask AI
- Bottom nav links
- Hero CTAs
- Filter chips
- AttractionCard links
- Plan: Add, Remove, Book
- Bookings: Load button, Browse wineries
- Winery booking form: inputs, submit
- Back links

**Target:** 44px minimum (WCAG 2.5.8 allows 24px but recommends 48px for touch). Cyprus uses 44px — acceptable; bump to 48px for primary CTAs if room allows.

---

## 5. Implementation Checklist

### Phase 1 (P0) — Est. 2–4 hours ✅

- [x] Hero CTA hierarchy (page.tsx)
- [x] FilterChips active ring (FilterChips.tsx)
- [x] Bookings email sync banner (bookings/page.tsx)
- [x] aria-labelledby on Home, Discover, Trails sections

### Phase 2 (P1) — Est. 4–6 hours ✅

- [x] Card border consistency (page.tsx)
- [x] Plan place picker: search added (PlacePicker already had tabs)
- [x] Touch target audit: Hero Discover, Ask AI, Copy itinerary, Browse wineries → 48px
- [x] Form label verification (WineryBookingForm, bookings — confirmed)
- [x] Loading aria (plan/loading: aria-busy, aria-live, role="status")
- [x] Back link: list pages use "← Back"; detail pages use "← Back to {section}" (PageHeader backLabel) — intentional

### Phase 3 (P2) — Est. 4–8 hours

- [x] Home scroll: Why Cyprus accordion (details/summary)
- [x] Section spacing: SECTION.pySub added; rhythm documented
- [x] Mood pill aria-labels (all pills have descriptive aria-label)
- [ ] Wellness label (N/A — no Wellness mood pill in current design)
- [ ] Icon set (optional — defer)
- [ ] Contrast audit (manual verification recommended)

---

## 6. Files Reference

| Area | Files |
|------|-------|
| Home | `src/app/page.tsx` |
| Discover | `src/app/discover/page.tsx`, `src/app/discover/[id]/page.tsx` |
| Trails | `src/app/trails/page.tsx`, `src/app/trails/[id]/page.tsx`, `src/app/trails/[id]/report/page.tsx` |
| Plan | `src/app/plan/page.tsx`, `PlacePicker.tsx` |
| Bookings | `src/app/bookings/page.tsx` |
| Components | `PageHeader.tsx`, `AttractionCard.tsx`, `FilterChips.tsx`, `Nav.tsx`, `BottomNav.tsx` |
| Global | `src/app/globals.css`, `src/lib/design-tokens.ts` |
| Forms | `WineryBookingForm.tsx` |

---

## 7. Success Criteria

- [x] Hero has one clear primary CTA (Discover filled; secondary outline)
- [x] Active filter chip is visually distinct (ring)
- [x] Bookings page clearly explains email sync (banner)
- [x] All major sections have aria-labelledby
- [x] Plan place picker is easier to scan (search + tabs)
- [x] All interactive elements meet 44px minimum; primary CTAs 48px
- [x] Form inputs have proper labels
- [x] Loading states have appropriate ARIA
