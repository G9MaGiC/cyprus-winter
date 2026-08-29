# Cyprus Winter — Persona-driven priorities (RICE) — Winter 2026

**Status:** Living document  
**Owner:** Product / QA  
**Last updated:** May 2026  
**Purpose:** Rank improvements surfaced by full-stack personas into an actionable backlog.  
**Related:** `docs/QA_PERSONAS_FULL_STACK_2026.md`, `docs/QA_MARKET_CONTEXT_WINTER_2026.md`, `docs/QA_PERSONA_JOURNEYS_2026.md`, `docs/QA_BUGS.md`

---

## How to read this doc

**RICE** (simplified for planning):

| Factor | Meaning |
|--------|---------|
| **Reach** | % of winter users affected (1–10) |
| **Impact** | Improvement if shipped (1–10) |
| **Confidence** | Evidence strength from personas/market (0.5–1.0) |
| **Effort** | Person-weeks (higher = worse) |
| **Score** | `(Reach × Impact × Confidence) / Effort` |

Scores are **relative** for prioritization debates, not precise forecasts.

**Status:** `Open` | `In progress` | `Done` | `Won't fix`

---

## P0 — Trust & conversion blockers

| ID | Initiative | Personas | R | I | C | E | Score | Status |
|----|------------|----------|---|---|---|---|-------|--------|
| P0-01 | **Booking post-submit clarity** (what happens next, SLA, check bookings, confirmation copy) | IL-01, UK-01, PL-01 | 9 | 9 | 0.9 | 1 | **72.9** | Done |
| P0-02 | **Travel trust module** (calm links to official sources; no hype during alerts) | CRISIS-01, IL-01, UK-01 | 8 | 9 | 0.8 | 2 | **28.8** | Done |
| P0-03 | **Plan `?add=` must not cancel navigation** (`patchPlanUrlSearchParams` pattern) | IL-01 | 7 | 10 | 1.0 | 0.5 | **140** | Done |
| P0-04 | **Locale preserved on plan URL actions** (i18n router) | GR-01, PL-01 | 7 | 9 | 1.0 | 0.5 | **126** | Done (verify regressions) |

---

## P1 — Core market fit (top 5 arrival countries)

| ID | Initiative | Personas | R | I | C | E | Score | Status |
|----|------------|----------|---|---|---|---|-------|--------|
| P1-01 | **Plan realism: drive-time warnings** between stops | PL-01, DE-01, UK-01 | 8 | 8 | 0.7 | 3 | **14.9** | Done (MVP heuristics) |
| P1-02 | **Daylight / pace hints** on plan days (sunset, “tight day”) | NORD-01, DE-01, UK-01 | 7 | 7 | 0.7 | 2 | **17.2** | Done |
| P1-03 | **Trail conditions trust** (official vs community, timestamp prominence) | DE-01, UK-01 | 6 | 8 | 0.9 | 1.5 | **28.8** | Done |
| P1-04 | **Search aliases** (PL/EL spellings, alternate place names) | PL-01, GR-01 | 6 | 7 | 0.8 | 2 | **16.8** | Done |
| P1-05 | **Winery price / appointment hints** on cards + book | PL-01, UK-01, IL-01 | 7 | 7 | 0.8 | 1.5 | **26.1** | Done |
| P1-06 | **i18n fuzz pass** (booking errors, edge modals, discover filters) | PL-01, DE-01, GR-01 | 8 | 6 | 0.9 | 2 | **21.6** | Done (combos localized; ro/fr/he added) |
| P1-07 | **Hero system consistency** (list crop, discover search padding, detail top margin) | UK-01, UK-02 | 9 | 5 | 0.9 | 1 | **40.5** | Done (LCP sizes + prior hero commits) |
| P1-08 | **Map mobile interaction** audit all surfaces | DE-01, PL-01 | 7 | 7 | 0.9 | 1 | **44.1** | Done (all Leaflet surfaces use `MapInteractionGuard`) |

---

## P2 — Growth segments & depth

| ID | Initiative | Personas | R | I | C | E | Score | Status |
|----|------------|----------|---|---|---|---|-------|--------|
| P2-01 | **Family template v2** (rain day, age tags, less AI nudge) | UK-02, PL-01 | 5 | 8 | 0.8 | 2 | **16.0** | Done |
| P2-02 | **Workation template** (wifi, month weather tie-in) | DE-02 | 3 | 7 | 0.6 | 2 | **6.3** | Done |
| P2-03 | **“Local winter” editorial lane** (GR-first picks, Nicosia food) | GR-01 | 4 | 6 | 0.7 | 2 | **8.4** | Done (`?filter=local`) |
| P2-04 | **Day combos as first-class UI** (package-feel days) | RO-01, PL-01 | 4 | 7 | 0.7 | 2 | **9.8** | Done (Discover teaser + Plan) |
| P2-05 | **Accessible / low-mobility filter** | UK-01 | 3 | 8 | 0.8 | 1.5 | **12.8** | Done |
| P2-06 | **Plan export** (ICS or shareable text v2) | DE-01 | 4 | 6 | 0.8 | 2 | **9.6** | Done (ICS download) |
| P2-07 | **Winery click-to-call** on detail/book | IL-01, UK-01 | 5 | 6 | 0.9 | 0.5 | **54.0** | Done (existing) |

---

## P3 — Locales & platform

| ID | Initiative | Personas | R | I | C | E | Score | Status |
|----|------------|----------|---|---|---|---|-------|--------|
| P3-01 | **Hebrew critical paths** (book, plan, discover) | IL-01 | 5 | 7 | 0.6 | 4 | **5.3** | Partial (`he` + RTL; nav/plan/discover/book critical strings) |
| P3-02 | **Romanian locale** (or EN first-visit path) | RO-01 | 3 | 6 | 0.5 | 4 | **2.3** | Partial (`ro` + critical-path copy) |
| P3-03 | **French locale** | FR-01 | 2 | 5 | 0.5 | 4 | **1.3** | Partial (`fr` + critical-path copy) |
| P3-04 | **LCP budget / hero image strategy** | PERF-01 | 9 | 5 | 0.8 | 2 | **18.0** | Partial (preload on discover/trails/plan/events/airport + fetchPriority) |
| P3-05 | **Offline read-only plan** | PERF-01 | 4 | 6 | 0.5 | 4 | **3.0** | Partial (offline banner + read-only edits; no SW cache) |
| P3-06 | **WCAG 2.2 AA audit** (discover, plan, book) | A11Y-01 | 8 | 7 | 0.9 | 3 | **16.8** | Done (BUG-351 fixed): structure clean on 11 pages; AA palette shipped (terracotta #B55738, sage #5B7967, muted-ink #666B78); `npm run test:a11y` hard-gates structure + contrast |

---

## B2B / ops

| ID | Initiative | Personas | R | I | C | E | Score | Status |
|----|------------|----------|---|---|---|---|-------|--------|
| B2B-01 | **Partner lead email + SLA documentation** | B2B-01 | 4 | 8 | 0.9 | 1 | **28.8** | Done (guest email) |
| B2B-02 | **Winter hours data audit** pipeline | B2B-01, PL-01 | 5 | 7 | 0.8 | 2 | **14.0** | Done (`winter-hours-audit.test.ts` in `data:validate`) |

---

## Recommended sprint slices

### Sprint A (trust + conversion)
- P0-01 Booking post-submit
- P0-02 Travel trust module (minimal)
- P1-05 Winery appointment hints
- Verify P0-03, P0-04 in E2E

### Sprint B (plan quality)
- P1-01 Drive-time warnings (MVP: same region heuristic)
- P1-02 Daylight hints
- P2-04 Day combos UI

### Sprint C (markets)
- P1-04 Search aliases
- P1-06 i18n fuzz
- P2-01 Family template v2

### Sprint D (platform)
- P1-08 Map audit
- P3-06 A11y audit
- P3-04 LCP heroes

---

## Mapping to existing product docs

| PRD persona | Full-stack personas |
|-------------|---------------------|
| Cultural Explorer | UK-01, GR-01, FR-01, Claire |
| Active Adventurer | DE-01, NORD-01, UK-02 (trails) |
| Digital Nomad | DE-02, Anna |

---

## Review cadence

- **Monthly:** Re-score P0-02 and locale items if CySTAT shifts market mix.
- **Each release:** Run persona gate from `docs/QA_PERSONA_JOURNEYS_2026.md` § Release gate.
- **After geopolitical events:** Run CRISIS-01 journey + copy review within 48h.

---

*Update scores when items ship; move to `docs/QA_BUGS.md` for defect-level tracking.*
