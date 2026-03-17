## Golden Flows QA — P1/P2 findings (mobile + locales)

**Date:** 2026-03-17  
**Scope:** GF1–GF6 spot-check on mobile viewport, locales `de`, `el`, `pl` (plus partial navigation checks).  
**Note:** Baseline gates (lint/test/build) are green.

### P1 — Fix before launch polish

1) **Locale pages show English breadcrumb/back labels**
   - **Where:** `/de/plan`, `/de/discover/[id]`, `/de/search` (and likely other list/detail pages)
   - **Repro:**
     1. Visit `http://localhost:3000/de/plan`
     2. Observe hero back link and breadcrumb items (e.g. “← Home”, “Home”).
   - **Expected:** Locale-aware labels (e.g. German “Start” instead of “Home”), and translated breadcrumb labels.
   - **Actual:** English “Home/Discover/Search” appear inside German locale.
   - **Suspected files:** 
     - `src/app/(padded)/plan/page.tsx` (`ListPageHero` props `backLabel`, `breadcrumbItems`)
     - `src/app/(padded)/search/page.tsx` (BackLink/Breadcrumbs labels)
     - `src/app/(padded)/discover/[id]/page.tsx` (breadcrumb items)
     - Any page that passes raw strings into `BackLink`, `ListPageHero`, or `Breadcrumbs`.

2) **Search page heading/copy not localized**
   - **Where:** `http://localhost:3000/de/search`
   - **Repro:** Open `/de/search`
   - **Expected:** Localized “Search” page heading and intro copy.
   - **Actual:** “Find a place or trail” and other page text appears in English.
   - **Suspected file:** `src/app/(padded)/search/page.tsx` (hardcoded headings/copy).

3) **Same English breadcrumb/back labels reproduced in `el` and `pl`**
   - **Where:** `/el/plan`, `/el/search`, `/el/discover/[id]` and `/pl/plan`, `/pl/search`, `/pl/discover/[id]`
   - **Repro:** Visit any of these pages and observe the hero back link and breadcrumb labels.
   - **Expected:** Localized labels (Greek/Polish equivalents).
   - **Actual:** English labels like “← Home”, “Home”, “Discover”, “Search”.
   - **Evidence:** On `/el/search` snapshot shows “Go back to Home” + “Home” + “Find a place or trail”. On `/pl/search` same.

### P2 — Backlog polish

1) **Discover detail content is English-heavy under non-English locales**
   - **Where:** `/de/discover/[id]` detail descriptions, sections like “Backstory”, long-form paragraphs.
   - **Expected:** Either localized content, or clearly intentional partial localization (e.g. labels translated, content stays English).
   - **Actual:** Mixed UI language can feel inconsistent (labels may be localized, descriptions remain English).
   - **Suspected files:** data localization scope (data content vs messages), `src/lib/localize.ts`, detail pages.

2) **Copy consistency: “Plan” vs “Itinerary” terminology**
   - **Where:** Plan page and components mention both “plan” and “itinerary” (varies by locale).
   - **Expected:** One primary term per locale (and consistent across UI + tracking copy).
   - **Suspected files:** `messages/*`, `src/hooks/useItinerary.ts` (share copy), plan components in `src/components/plan/*`.

### P0 confirmation (passed in this run)
- Locale preserved when adding from Discover detail to Plan (e.g. `/de/discover/<id>` → add → `/de/plan`).
- Search URL sync no longer produces `q=undefined` after hardening.

### Additional locale observations (not blockers, but useful)
- **Greek localized place names appear where `nameEl` exists** (e.g. Konnos Bay rendered as “Κόλπος Κόννος” on `/el/discover/konnos-bay`), while long-form descriptions remain English (expected with current data localization scope).

