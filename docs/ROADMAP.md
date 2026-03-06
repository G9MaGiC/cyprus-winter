# Cyprus Winter — Roadmap & Prioritization

**Ref:** PRD.md (Section 9), PROJECT_REVIEW.md  
**Last updated:** March 2026  
**Launch target:** November 1, 2026

---

## 1. Overview

This roadmap reconciles the PRD Winter phases with security fixes, UX gaps, and design debt from the project review. Priorities follow: **fix blockers → close revenue loop → deliver differentiators → scale**.

| Phase | PRD Scope | Target Window |
|-------|-----------|---------------|
| **Pre-launch** | Security, Plan→Book, design | Mar–Oct 2026 |
| **Phase 1 (MVP)** | Launch-ready product | Nov 2026 |
| **Phase 2 (Growth)** | Peak season optimization | Dec 2026–Feb 2027 |
| **Phase 3 (Retention)** | Summer conversion | Mar 2027 |

---

## 2. Current State vs Phase 1 MVP

| PRD Phase 1 Feature | Status | Gap |
|---------------------|--------|-----|
| Winter mode UI/UX | ✅ Done | Terracotta unified; viewport theme; amber→golden |
| 25 winter attractions | ✅ Done | 90+ places (trails, wineries, villages, etc.) |
| Basic trail conditions | ✅ Done | Static conditions on trails page + detail |
| Itinerary builder + winter templates | ✅ Done | Plan + Book tasting + 3 templates |
| 10 partner integrations | Partial | Winery booking live; partner count TBD |
| "Escape the Cold" campaign | Started | Meta/SEO; landing copy; campaign prep TBD |

---

## 3. Prioritization Framework

1. **Blockers** — Security and trust; must fix before any production launch  
2. **Revenue loop** — Plan → Book; core conversion funnel  
3. **Differentiation** — Trail conditions, winter-specific experience  
4. **Scale** — Phase 2 mechanics (crowd-sourced, gamification, referral)

---

## 4. Prioritized Action List

### Tier 0 — Blockers (2–3 weeks) ✅ Done

| # | Action | Status |
|---|--------|--------|
| 1 | Sanitize AI chat output (react-markdown) | ✅ |
| 2 | Exact match for booking email lookup | ✅ |
| 3 | Rate limiting on chat and bookings APIs | ✅ |

### Tier 1 — Revenue & Trust ✅ Done

| # | Action | Status |
|---|--------|--------|
| 4 | Add "Book tasting" for wineries in Plan | ✅ |
| 5 | Unify terracotta/aegean; design tokens | ✅ |
| 6 | Zod validation for bookings API | ✅ |
| 7 | Escape Resend email template values | ✅ |

### Tier 2 — Phase 1 Differentiators ✅ Done

| # | Action | Status |
|---|--------|--------|
| 8 | Basic trail conditions (static, trails page) | ✅ |
| 9 | Winter itinerary templates (Classic, Mountain, Coast) | ✅ |
| 10 | Weather on home (coast + Troodos) | ✅ |
| 11 | AI focus trap; safe-area on floating button | ✅ |
| 12 | Descriptive `alt` for images | ✅ |

### Tier 3 — Phase 1 Completion (Pre Nov 1)

| # | Action | Status |
|---|--------|--------|
| 13 | Content audit: verify 25 winter attractions | ✅ docs/CONTENT_AUDIT.md |
| 14 | Partner integrations: 5–7 wineries/guides by launch | Pending |
| 15 | Hero CTAs terracotta tint; hero image | ✅ CTAs done |
| 16 | "Escape the Cold" campaign prep | ✅ Meta, keywords; creative TBD |

**Additional polish (completed):**
- Plan: template confirm, link place names, refactor, Clear day, View all days
- Discover: filter chips, filter=nature→beach, Nature & coasts mood on home
- Plan metadata, health endpoint Supabase check

**Polish sprint (Mar 2026):**
- Accessibility: aria-labelledby, form labels, skip link, role=alert, focus styles
- Mobile: hero height, mood pills scroll, 44px touch targets (hero, mood, nav, filters, plan, bookings)
- Code: removeFromDay, getPlaceById, isWinery type guard, RelatedPlacesBlock, formatReportedAgo, PlacePicker→allPlaces
- UX: loading.tsx for discover/[id], trails/[id], book/winery/[id], trails/[id]/report; LAYOUT tokens
- Content: Wellness→Monasteries & culture; Governor's Beach chalk→white cliffs; winter-tips on airport & trails
- Design: LAYOUT constants (list, listNarrow, detail, form, formNarrow) used across pages and loading skeletons

**Follow-up polish (Mar 2026):**
- windKmh naming consistency (trails data, API, UI)
- StoredBooking → Booking type alignment (bookings page)
- PlacePicker empty state when category has no places
- getAttractionById entity lookup helper; discover/[id] uses it
- README typography updated to match app (Fraunces, Inter)
- FilterChips component extracted; discover and trails use it
- Emergency numbers: add ambulance 199 to hero and not-found
- Card hover: Go deeper golden/50 (featured); Essentials/Quick picks terracotta/30
- Bookings: loading aria-busy/aria-label; sync banner when empty
- Error page: add ambulance 199 to emergency line
- Winery booking form: submit button aria-busy, aria-label
- Emergency 199: AI context, layout footer

**Visual QA (Mar 2026):**
- P0: Touch targets 44px — skip link, AIAssistantTrigger, trail report buttons, winery submit
- P1: Design tokens (emerald/red/amber → aegean/terracotta); sand-50 → sand-100; card borders; not-found emergency order
- P2: LAYOUT on home, error, not-found; FilterChips ring/ring-offset; inline links aegean; AIAssistant close/retry/listen touch targets
- Remaining: ~~badge sizing~~ ✓; ~~mood pills bg-terracotta~~ ✓; card padding p-5/p-6 (acceptable variance); ~~bookings links aegean~~ ✓

**Designer Review (Mar 2026):**
- Process launched: docs/DESIGNER_REVIEW.md
- First run: DESIGNER_REVIEW_2026-03-05.md — design system applied; Mediterranean identity consistent; no blockers

### Tier 4 — Phase 2 (Dec 2026–Feb 2027)

| # | Action | Owner | Ref |
|---|--------|-------|-----|
| 17 | Crowd-sourced trail conditions | Eng | ✅ Migration, API, report form, merge with trail detail |
| 18 | Group hike matching | Product | Phase 2 |
| 19 | "Winter Explorer" gamification (badges, streaks) | Product | Phase 2 |
| 20 | Digital nomad hub integration | Product | Phase 2 |
| 21 | Referral program optimization | Growth | Phase 2 |
| 22 | 50 additional attractions | Content | Phase 2 |

### Tier 5 — Phase 3 (Mar 2027)

| # | Action | Owner | Ref |
|---|--------|-------|-----|
| 23 | "Cyprus Wrapped" winter edition | Product | Phase 3 |
| 24 | Summer booking pre-launch | Product | Phase 3 |
| 25 | Return visitor incentives | Growth | Phase 3 |

---

## 5. Success Criteria (Revised)

PRD targets are ambitious for a first launch. Revised targets with staged goals:

| Metric | PRD Target | Revised Nov 2026 | Stretch |
|--------|------------|------------------|---------|
| Installs | 10,000 | 2,000 | 5,000 |
| MAU | 8,000 | 500 | 1,500 |
| Revenue (season) | €3K | €1K | €3K |
| Itineraries built | 5,000 | 500 | 1,500 |
| Partner integrations | 10 | 5–7 | 10 |

**Phase 2 (Jan–Feb 2027):** 5,000 MAU, 15% booking rate, €5K monthly revenue  
**Phase 3 (Mar 2027):** 40% of winter users engage with summer content

---

## 6. Execution Timeline

```
Mar 2026          Apr–Jun 2026        Jul–Sep 2026        Oct 2026         Nov 1
├─ Tier 0         ├─ Tier 2           ├─ Tier 3           ├─ Beta           └─ Launch
│  (security)     │  trail conditions │  partners         │  polish
│                 │  templates        │  content audit    │
├─ Tier 1         │  weather          │  campaign prep    │
│  Plan→Book      └─ Tier 2 polish    └───────────────────┴──────────────────
   design
```

| Week | Focus |
|------|-------|
| 1–2 | Tier 0 (security, rate limiting) |
| 3–4 | Tier 1 (Plan→Book, design, validation, email escape) |
| 5–8 | Tier 2 (trail conditions, templates, weather, UX polish) |
| 9–24 | Tier 3 (partners, content, campaign); parallel track |
| 25–26 | Beta testing, final polish |
| 27 | Launch Nov 1 |

---

## 7. Dependencies & Risks

| Risk | Mitigation |
|------|------------|
| Trail conditions: who updates? | Start with static/seed data; define CMS or Forestry Dept workflow later |
| 10 partners by Nov | Start outreach now; aim 5–7 for launch |
| Campaign budget | Align with CTO/DMT; consider grant co-op |
| Security delays | Tier 0 blocks all launch; complete first |

---

## 8. Traceability

- **docs/SEO_ROADMAP.md** — SEO content roadmap (P0 fast traffic, P1 medium-term)
- **docs/QA_PLAN.md** — CTO QA plan: bug discovery, fix prioritization, execution checklist
- **PRD.md** — Section 9 (Winter Roadmap), Section 7 (Technical Implementation)
- **docs/CMO_CONTENT_REVIEW.md** — CMO-led content and conversion review process (launched Mar 2026; first run CMO_REVIEW_2026-03-04.md)
- **docs/DESIGNER_REVIEW.md** — Website designer review process (launched Mar 2026; first run DESIGNER_REVIEW_2026-03-05.md)  
- **PROJECT_REVIEW.md** — Prioritized Action List, Audit Findings  
- **GRANT_STRATEGY.md** — Grant-aligned features (trail conditions, SME booking, sustainability)  
- **TRACTION.md** — Primary metric: bookings/month; secondary: MAU, itinerary completion, AI chat %
