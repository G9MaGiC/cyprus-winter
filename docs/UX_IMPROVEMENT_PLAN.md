# Cyprus Winter — UX/UI Improvement Plan

**Purpose:** Phased plan for UX/UI improvements with clear continuation points for each session.  
**Best team:** `ux-polish` (lead) + `branding-redesign` (support)  
**Reference:** `.cursor/TEAM_VISUAL_QA.md`, `docs/QA_PLAN.md`, `.cursor/skills/cyprus-tourism-app/SKILL.md`

---

## Best Team for UX/UI

| Role | Subagent | Responsibility |
|------|----------|----------------|
| **Lead** | `ux-polish` | User flows, touch targets, spacing, loading/empty/error states, accessibility |
| **Support** | `branding-redesign` | Design tokens, colors, typography, component patterns, Mediterranean consistency |
| **Optional** | `audit-explore` | Cross-page checks, anomaly discovery, link validation |

**Invoke via `mcp_task` with `subagent_type: "TEAM-AGENTS"`.**

---

## Continuation Plan

Each section below is a **single-session scope**. Pick the next unfixed continuation and run it; log findings to `docs/QA_BUGS.md`; fix; then move to the next.

---

### Continuation 1 — Visual Anomaly Audit

**Goal:** Identify all visual inconsistencies across the app.  
**Team:** branding-redesign (design system) + ux-polish (layout, states)  
**Output:** Prioritized list of anomalies → add to `QA_BUGS.md`

**Tasks:**
1. Run branding-redesign with `.cursor/TEAM_VISUAL_QA.md` design-system checklist (colors, typography, components).
2. Run ux-polish with layout/spacing/touch-target checklist.
3. Merge findings into one list (P0 → P1 → P2).
4. Log each as a bug in `docs/QA_BUGS.md` with severity and file:line.
5. Optionally run `explore` for cross-page outliers.

**Invocation example:**
```javascript
mcp_task({ subagent_type: "TEAM-AGENTS", prompt: "You are the branding-redesign subagent. Visual QA for Cyprus Winter. Run anomaly checklist from .cursor/TEAM_VISUAL_QA.md. Report: Category → File:Line → Current → Suggested → Severity (P0–P2)." })
mcp_task({ subagent_type: "TEAM-AGENTS", prompt: "You are the ux-polish subagent. Visual QA for Cyprus Winter. Run anomaly checklist from .cursor/TEAM_VISUAL_QA.md. Check layout, spacing, touch targets, loading/empty/error states. Report: File:Line → Severity (P0–P2)." })
```

**Exit criteria:** All anomalies documented; next continuation is fixing them.

---

### Continuation 2 — Fix P0 Design Tokens & Colors

**Goal:** Fix all P0 color and token issues.  
**Team:** branding-redesign (primary), ux-polish (review)

**Typical fixes:**
- Replace hardcoded hex with Tailwind tokens.
- Standardize CTA colors (terracotta primary, aegean secondary).
- Align border/background callout styles (e.g. `bg-olive/5`, `bg-golden/5`).
- Ensure emergency 112/1460/199 formatting is consistent.

**Verification:**
- `npm run build` passes.
- No new lint errors.
- Re-scan affected files with branding-redesign.

**Exit criteria:** Zero P0 color/token anomalies.

---

### Continuation 3 — Fix P1 Layout & Spacing

**Goal:** Fix layout and spacing inconsistencies.  
**Team:** ux-polish (primary), branding-redesign (review)

**Typical fixes:**
- Align page padding to LAYOUT tokens (`LAYOUT.safeAreaX`, `LAYOUT.pagePy`, `LAYOUT.pagePyDetail`).
- Standardize section spacing (`mb-6`, `mb-8` per SECTION tokens).
- Ensure card padding uses `CARD.content` or `CARD.contentLg`.
- Fix LAYOUT width usage (list vs listNarrow, detail vs form).

**Verification:**
- Manual check: Home, Discover, Trails, Plan, Detail pages at 375px and 1280px.
- No layout shift on load.

**Exit criteria:** All P1 layout/spacing issues resolved.

---

### Continuation 4 — Component Consistency (Cards, CTAs, Badges)

**Goal:** Standardize cards, CTAs, and badges.  
**Team:** branding-redesign (primary), ux-polish (review)

**Typical fixes:**
- Cards: use `CARD.base` + `CARD.hover`; consistent `rounded-xl`, `border-sand-200`.
- CTAs: use `CTA.primary`, `CTA.secondary`, `CTA.chipPrimary`, etc. from design-tokens.
- Badges/chips: align FilterChips, status badges, type badges to PILL/CARD patterns.
- Tip/callout boxes: one consistent style.

**Verification:**
- Side-by-side check: AttractionCard, TrailCard, Plan cards, PlacePicker.
- All CTAs use tokens.

**Exit criteria:** No P1 component anomalies left.

---

### Continuation 5 — States & Feedback (Loading, Empty, Error)

**Goal:** Align loading, empty, and error states with design system.  
**Team:** ux-polish (primary), branding-redesign (review)

**Typical fixes:**
- Loading: skeletons match page layout; use `EMPTY_STATE` / `EMPTY_STATE_DASHED` where appropriate.
- Empty: Plan empty day, bookings empty, search no-results use EMPTY_STATE variants.
- Error: `error.tsx`, `not-found.tsx` use LAYOUT and CTA tokens.
- Touch targets: all interactive elements ≥ 44px.

**Verification:**
- Manually trigger loading, empty, and error states.
- axe DevTools for contrast and focus.

**Exit criteria:** All state-related P1s fixed; touch targets validated.

---

### Continuation 6 — Accessibility & Mobile Polish

**Goal:** WCAG 2.5 alignment and mobile UX.  
**Team:** ux-polish (primary)

**Tasks (from `docs/QA_PLAN.md` §2.5, §2.6):**
- Contrast: axe DevTools, Lighthouse.
- Focus order: tab through key flows.
- Labels: all inputs have label or aria-label.
- Skip link: verify focus lands on main.
- Mobile: 375px, 393px, 412px; safe area; floating AI button vs BottomNav.
- PlacePicker, Plan day tabs, FilterChips scroll behavior.

**Verification:**
- Lighthouse a11y score; axe zero critical.
- Test on real device or Chrome DevTools device toolbar.

**Exit criteria:** P0/P1 a11y issues fixed; mobile flows smooth.

---

### Continuation 7 — Cross-Page Consistency

**Goal:** Footer, hero, nav, emergency info consistent.  
**Team:** audit-explore + ux-polish

**Checks:**
- Footer/hero emergency line identical format.
- PageHeader / BackLink on all detail and form pages.
- Nav active state styling and pathname logic.
- Hero CTAs and tertiary links use HERO + CTA tokens.

**Verification:**
- Full flow: Home → Discover → Detail → Plan → Book.
- Verify nav highlights correctly.

**Exit criteria:** Cross-page checklist items addressed.

---

### Continuation 8 — Regression & Sign-off

**Goal:** Ensure no regressions; record baseline metrics.  
**Team:** shell (automated) + ux-polish (smoke test)

**Tasks:**
1. `npm run lint` — zero errors.
2. `npm run test` — all pass.
3. `npm run build` — success.
4. Re-run Visual QA (branding-redesign + ux-polish) and confirm no new anomalies.
5. Smoke test: Discovery → Detail, Trails → Report, Plan → Book, AI chat.

**Exit criteria:** All automated checks pass; Visual QA clean; key flows verified.

---

## Summary

| # | Continuation | Lead | Outcome |
|---|--------------|------|---------|
| 1 | Visual anomaly audit | branding + ux-polish | Anomalies logged |
| 2 | P0 tokens & colors | branding-redesign | P0 colors fixed |
| 3 | P1 layout & spacing | ux-polish | Layout consistent |
| 4 | Component consistency | branding-redesign | Cards/CTAs/badges aligned |
| 5 | States & feedback | ux-polish | Loading/empty/error polished |
| 6 | Accessibility & mobile | ux-polish | A11y + mobile verified |
| 7 | Cross-page consistency | audit + ux-polish | Footer, nav, hero aligned |
| 8 | Regression & sign-off | shell + ux-polish | Clean baseline |

---

## Quick Start

1. Run **Continuation 1** to get the anomaly list.
2. Log findings in `docs/QA_BUGS.md`.
3. On next session, pick **Continuation 2** (or the next unfixed).
4. After each fix batch, run `npm run build` and re-check.

---

## Completion (Mar 2026)

All 8 continuations completed. Post-fix Visual QA: clean. One additional polish: RelatedPlacesBlock hover → terracotta-muted.
