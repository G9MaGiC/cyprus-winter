# Cyprus Winter — ICP Stress Test Matrix

**Date:** March 7, 2026  
**Purpose:** Map each Ideal Customer Profile to concrete flows, URLs, APIs, and edge cases for stress testing.  
**Refs:** [USER_ICPS.md](./USER_ICPS.md), [ICPS.md](./ICPS.md), [REVERSE_ENGINEERING_ICPS.md](./REVERSE_ENGINEERING_ICPS.md)

---

## Flow-to-URL/API Mapping

| Flow stage | URLs | API calls |
|------------|------|-----------|
| **Discover** | `/discover`, `/discover/[id]`, `?filter=village`, `?filter=winery`, `?filter=nature`, `?filter=family` | — |
| **Trails** | `/trails`, `/trails/[id]`, `/trails/[id]/report`, `?region=`, `?difficulty=` | POST `/api/trail-reports` |
| **Plan** | `/plan`, `?add=[id]` | — (localStorage `cyprus-winter-itinerary`) |
| **Book** | `/book/winery/[id]`, `/bookings` | POST `/api/bookings`, GET `/api/bookings?email=` |
| **AI** | (floating trigger) | POST `/api/chat` |
| **Search** | `/search?q=` | — |
| **Airport** | `/airport` | — |
| **Events** | `/events` | — |

---

## ICP-to-Use-Case Matrix

| ICP | Primary flows | Key touchpoints | Edge cases to stress |
|-----|---------------|-----------------|----------------------|
| **Claire** (Cultural Explorer) | Discover → Detail → Add to Plan → Book winery | Villages, Wineries, AI chat | 5-day plan cap, invalid attraction id |
| **Anders** (Active Adventurer) | Trails → Detail → Report conditions | Trails filters, trail reports, Mountain template | Invalid trail id, report validation |
| **Nadia** (Digital Nomad) | Discover → Weekend picks, Plan → 5-day max | Search, AI "weekend" suggestions | No nomad filter, plan cap |
| **Family** (Winter Sun Family) | Discover → family filter (if exists) | bestFor, accessibility fields | Empty filter, stroller notes |
| **Local** (Local Resident) | Trails, Events, weekend discovery | Events, trail conditions | Events list-only, no resident path |
| **Expat** (Expat Resident) | Same as Local + Explore beyond default | Discover, trails | Same gaps as Local |
| **Bleisure** (Business/Bleisure) | Airport → Quick picks, 1-day plan | Airport page, "Just arrived?" | Short-stay template absence |

---

## Detailed Flow Steps by ICP

### Claire (Cultural Explorer)

| Step | Action | URL / API |
|------|--------|-----------|
| 1 | Home | `/` |
| 2 | Discover | `/discover` |
| 3 | Filter village/winery | `/discover?filter=village` or `?filter=winery` |
| 4 | Card → detail | `/discover/[id]` (e.g. `/discover/omodos`) |
| 5 | Add to plan | Client: `useItinerary.add(id)` |
| 6 | Plan page | `/plan` |
| 7 | Add winery → Book | `/book/winery/[id]` |
| 8 | Submit booking | POST `/api/bookings` |
| 9 | AI: "Best wineries" | POST `/api/chat` |
| Edge | Invalid id | `/discover/invalid-id-12345` → 404 |

### Anders (Active Adventurer)

| Step | Action | URL / API |
|------|--------|-----------|
| 1 | Trails | `/trails` |
| 2 | Filter region/difficulty | `/trails?region=troodos` or `?difficulty=moderate` |
| 3 | Trail detail | `/trails/[id]` (e.g. `/trails/artemis`) |
| 4 | Report conditions | `/trails/[id]/report` |
| 5 | Submit report | POST `/api/trail-reports` |
| 6 | Mountain template | Plan → apply template |
| 7 | AI: "Artemis conditions" | POST `/api/chat` |
| Edge | Invalid trail | `/trails/invalid-slug` → 404 |
| Edge | Invalid payload | POST with invalid status/surface → 400 |

### Nadia (Digital Nomad)

| Step | Action | URL / API |
|------|--------|-----------|
| 1 | Discover / weekend picks | `/discover` |
| 2 | Search "Omodos" | `/search?q=omodos` |
| 3 | AI: "weekend escapes" | POST `/api/chat` |
| 4 | Plan → 5-day max | `/plan` |
| Edge | No nomad filter | Discover has no `?filter=nomad` |
| Edge | No 30-day template | Plan templates cap at 5 days |

### Family (Winter Sun Family)

| Step | Action | URL / API |
|------|--------|-----------|
| 1 | Discover | `/discover` |
| 2 | Family filter (if exists) | `/discover?filter=family` |
| 3 | Detail → bestFor/accessibility | `/discover/[id]` |
| Edge | No family chip | Filter chips omit "Family-friendly" |
| Edge | Accessibility notes buried | In content, not surfaced |

### Local / Expat

| Step | Action | URL / API |
|------|--------|-----------|
| 1 | Events | `/events` |
| 2 | Trails | `/trails` |
| 3 | Discover | `/discover` |
| Edge | Events list-only | No event detail page |
| Edge | No resident mode | No "I live here" entry point |

### Bleisure

| Step | Action | URL / API |
|------|--------|-----------|
| 1 | Airport | `/airport` |
| 2 | "Just arrived?" flow | Airport page CTAs |
| Edge | No 48h template | Plan has no short-stay template |

---

## Common Cross-ICP Edge Cases

| Scenario | Test | Expected |
|----------|------|----------|
| Search empty query | `/search?q=` | Graceful handling |
| Search no results | `/search?q=zzzzz` | "No results" empty state |
| PlacePicker "zzzzz" | Plan → Add → search | "No places in this category" |
| AI 503 | No MOONSHOT_API_KEY | Friendly error, no stack trace |
| AI 429 | 60+ requests/min | Rate limit message |
| Bookings email lookup | GET `/api/bookings?email=...` | Exact match only |
| Bookings empty state | No bookings for email | Empty state + CTA |
| Supabase down | Health, bookings, trail reports | Graceful degradation |

---

## Baseline Run (Phase 1)

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run test` | Pass (130 tests) |
| `npm run build` | Pass |
| `npx tsc --noEmit` | Pass |
| `STRESS_BYPASS=1` stress test | Requires running server; see STRESS_TEST_RESULTS.md for prior run |
