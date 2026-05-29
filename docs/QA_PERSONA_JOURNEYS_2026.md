# Cyprus Winter — Persona scripted QA journeys (Winter 2026)

**Status:** Living document  
**Owner:** QA  
**Last updated:** May 2026  
**Related:** `docs/QA_PERSONAS_FULL_STACK_2026.md`, `docs/QA_MARKET_CONTEXT_WINTER_2026.md`, `docs/QA_PERSONA_PRIORITIES_2026.md`, `docs/QA_PLAN.md`

---

## Conventions

- **Viewports:** 320, 375, 768, 1280 (minimum per journey)
- **Locales:** Test persona’s primary locale first, then `en` fallback
- **Log format:** `PERSONA-{ID} | step | pass/fail | notes`
- **Automation:** Steps marked **[A]** map to Playwright where noted
- **Bug log:** Use `docs/QA_BUGS.md` template; tag `Persona: UK-01` in notes

---

## UK-01 — Skeptical Sun Seekers

**Goal:** Gentle week planned + one booking with confidence.

| Step | Action | Pass criteria |
|------|--------|---------------|
| 1 | `/` → Discover | Hero readable; no nav overlap on title |
| 2 | Discover → filter villages/wineries | Cards show region + type |
| 3 | Detail → Add to plan | Lands on `/plan` with item visible |
| 4 | Plan day 1 | ≤3 items plausible for same region (manual) |
| 5 | Book tasting on winery row | Reaches `/book/winery/[id]` |
| 6 | Submit booking | Clear next steps; email mentioned |
| 7 | `/bookings` | Booking visible or explained if empty |

**[A]** `e2e/discover-plan.spec.ts`, `e2e/plan-book.spec.ts`, `e2e/hub-footer.spec.ts`

---

## PL-01 — Polish Value Architects

| Step | Action | Pass criteria |
|------|--------|---------------|
| 1 | `/pl/discover` | UI Polish; no English leaks in main funnel |
| 2 | Filter family or nature | Results sensible; count announced (SR) |
| 3 | `/pl/plan?add=omodos` (or winery id) | Stays `/pl/plan` after add; item on plan |
| 4 | Book winery | PL validation messages on blur/submit |
| 5 | 320px | Filter toggle 44px; no page-level horizontal scroll |
| 6 | Search “Lemesos” or “Limassol” | Finds relevant results |

**[A]** `e2e/locale-prefixed-route.spec.ts`, `e2e/discover-filters.spec.ts`

---

## IL-01 — Tel Aviv Weekenders

| Step | Action | Pass criteria |
|------|--------|---------------|
| 1 | `/discover` → add winery → plan in &lt;5 min | No stuck on `/plan` after tapping Book tasting |
| 2 | Tap Book tasting **immediately** after `?add=` resolves | Navigates to `/book/winery/[id]` (race regression) |
| 3 | AI: “winery open Saturday near Limassol” | Sane suggestions; sanitized output |
| 4 | Crisis week (manual copy review) | No offensive hype; factual tone |

**[A]** `e2e/plan-book.spec.ts` (href navigation); manual click path on 375px

---

## DE-01 — Standards Hikers

| Step | Action | Pass criteria |
|------|--------|---------------|
| 1 | `/de/trails` | Hero + list; no overflow |
| 2 | Trail detail | Status badge, difficulty, map enable overlay |
| 3 | Report conditions | Validation errors in DE |
| 4 | Add trail + winery to plan | Manual: day not overloaded |
| 5 | Scroll past map without enabling | Page scroll works on touch |

**[A]** `e2e/trail-report.spec.ts`; manual map scroll on mobile-chrome if configured

---

## GR-01 — Cynical Athenian

| Step | Action | Pass criteria |
|------|--------|---------------|
| 1 | `/el/discover` | Greek UI on main chrome |
| 2 | `/el/discover/[id]` | `titleEl` when applicable |
| 3 | Add to plan → `/el/plan` | Locale preserved after processing |
| 4 | Plan share / copy link | Works; no locale drop |

**[A]** `e2e/locale-prefixed-route.spec.ts`, `e2e/plan-share.spec.ts`

---

## UK-02 — Half-Term Dad

| Step | Action | Pass criteria |
|------|--------|---------------|
| 1 | `/discover?filter=family` | Kid-relevant places |
| 2 | Plan template (e.g. short-stay) | Not overpacked (manual) |
| 3 | 375px scroll to footer | Last content not under BottomNav |
| 4 | `/events` | Hero + filters usable; sticky month nav OK |

**[A]** `e2e/discover-filters.spec.ts`, `e2e/hub-footer.spec.ts`

---

## DE-02 — Remote + Weekends

| Step | Action | Pass criteria |
|------|--------|---------------|
| 1 | `/plan` + trip dates widget | Dates persist after refresh |
| 2 | `/weather` + link from plan context | Consistent with winter messaging |
| 3 | Multi-day plan (5+ days) | Day selector usable on 375px |

Manual only.

---

## NORD-01 — Light Chasers

| Step | Action | Pass criteria |
|------|--------|---------------|
| 1 | Trail detail in morning | Stats readable in outdoor brightness |
| 2 | Plan with trail | Manual: would benefit from sunset hint (gap) |

Manual + a11y contrast check.

---

## RO-01 — First-Timers

| Step | Action | Pass criteria |
|------|--------|---------------|
| 1 | `/discover` → template or combo | Understandable “day bundle” |
| 2 | Book winery | Trust copy on form (who receives request) |

Manual.

---

## A11Y-01 — Accessibility Auditor

| Step | Action | Pass criteria |
|------|--------|---------------|
| 1 | Keyboard: home → discover → plan | Focus visible throughout |
| 2 | Discover filter drawer (mobile) | `aria-expanded`; focus return on close |
| 3 | Plan modals (picker, clear day) | Escape closes; focus trapped correctly |
| 4 | Map “Enable map” | Announced; activatable via keyboard |
| 5 | Booking form | Errors linked to fields (`aria-describedby`) |

Manual; consider axe on `/discover`, `/plan`, `/book/winery/[id]`.

---

## PERF-01 — Performance Skeptic

| Step | Action | Pass criteria |
|------|--------|---------------|
| 1 | Lighthouse mobile: `/`, `/discover`, `/plan` | Team LCP/CLS thresholds |
| 2 | Throttle Fast 4G | Plan hydrates acceptably |
| 3 | Discover map tab | No long main-thread freeze |

Manual.

---

## B2B-01 — Winery Partner (smoke)

| Step | Action | Pass criteria |
|------|--------|---------------|
| 1 | Submit test booking on staging | Partner email (if Resend configured) readable |
| 2 | Winery detail data | `winterOpen`, hours match reality (content audit) |

Manual / staging.

---

## CRISIS-01 — Reconsideration (manual)

| Step | Action | Pass criteria |
|------|--------|---------------|
| 1 | Read home + book copy | No inappropriate urgency during “bad news” week |
| 2 | Official travel links | Present or consciously documented as out of scope |

Manual content review.

---

## Release gate (persona subset)

**Minimum per release:**

| Gate | Personas | Automated |
|------|----------|-----------|
| Core funnel | PL-01, IL-01, DE-01 | `npm run test:e2e:gate:ci` |
| Visual / heroes | UK-01, UK-02 @ 375 | Manual + home-smoke |
| i18n | PL-01, GR-01, DE-01 | `i18n:validate`, `i18n:scan --fail` |
| Discover layout | PL-01 @ 320 | Manual search block alignment |

---

## Playwright spec mapping

| Spec | Personas covered |
|------|------------------|
| `e2e/discover-plan.spec.ts` | PL-01, IL-01, UK-01 |
| `e2e/plan-book.spec.ts` | IL-01, UK-01 |
| `e2e/discover-detail.spec.ts` | UK-01, DE-01 |
| `e2e/discover-filters.spec.ts` | PL-01, UK-02 |
| `e2e/hub-footer.spec.ts` | UK-01, UK-02 |
| `e2e/locale-prefixed-route.spec.ts` | GR-01, PL-01 |
| `e2e/trail-report.spec.ts` | DE-01 |
| `e2e/overlay-precedence.spec.ts` | A11Y-01 (partial) |
| `e2e/home-smoke.spec.ts` | UK-01 |

---

*Add steps when features ship (travel status module, workation template, drive-time warnings).*
