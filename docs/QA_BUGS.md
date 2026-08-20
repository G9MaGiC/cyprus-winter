# Cyprus Winter — QA Bug Log

**Purpose:** Track QA findings, fix status, and regressions. Alternative to GitHub Issues for local traceability.

**Template:** Use the format in `docs/QA_PLAN.md` Section 5.

---

## Bug Report Format

```markdown
## [BUG-XXX] Short title

**Severity:** Critical | High | Medium | Low
**Area:** Security | Functional | A11y | Mobile | Performance | Visual
**Page/Component:** e.g. /plan, AIAssistant, PlacePicker

### Reproduction
1. Step 1
2. Step 2
3. Step 3

### Expected
What should happen.

### Actual
What happens.

### Environment
Browser, viewport, device (if relevant)

### Fix status
Open | In progress | Fixed | Won't fix
```

---

## Active Bugs

### [BUG-i18n-PLAN-URL] Plan `?add=` drops locale on `[locale]/plan`

**Severity:** High  
**Area:** i18n / Functional  
**Page/Component:** `src/hooks/usePlanUrlActions.ts`

**Reproduction**
1. Visit `/de/discover/<id>`
2. Click “Add to plan” (goes to `/de/plan?add=<id>`)
3. Wait for URL param processing

**Expected**
Remains on `/de/plan` after adding.

**Actual**
Redirects to `/plan` (English/root) because `router.replace("/plan")` used the Next.js router without locale awareness.

**Fix status**
Fixed — switched to `useRouter` from `@/i18n/navigation` so `router.replace("/plan")` preserves locale.

### [BUG-i18n-SEARCH-SYNC] SearchBar URL sync drops locale on `[locale]/search`

**Severity:** High  
**Area:** i18n / Functional  
**Page/Component:** `src/components/SearchBar.tsx`

**Reproduction**
1. Visit `/de/search`
2. Type a query (SearchBar `syncUrl` updates the URL)

**Expected**
URL updates to `/de/search?q=...` and stays in the same locale.

**Actual**
URL updates to `/search` / `/search?q=...` (drops locale) when using Next.js router.

**Fix status**
Fixed — switched SearchBar routing to `useRouter` + `usePathname` from `@/i18n/navigation`, and replaced `window.location.href = ...` with `router.push(...)` for keyboard selection.

### [BUG-XXX] ConversionTracker wrong place/winery/guide ID on locale routes

**Severity:** High
**Area:** Functional / Analytics
**Page/Component:** ConversionTracker.tsx

**Reproduction**
1. Visit a locale route, e.g. /el/discover/omodos or /de/book/winery/tsiakkas
2. ConversionTracker extracts ID via pathname.replace("/discover/", "")

**Expected**
Place ID "omodos", winery ID "tsiakkas" — correct analytics events (winery_detail_view, booking_start)

**Actual**
ID extracted as "el/omodos" or "de/tsiakkas" — getPlaceById fails; no winery_detail_view tracked on non-default locales

**Fix status**
Fixed — use path.split("/").filter(Boolean).pop() for ID; use path.includes() for route detection (handles /el/discover/, etc.)

---

### [BUG-001] Broken /trip link on homepage hero

**Severity:** Critical
**Area:** Functional
**Page/Component:** HomeHero, /

**Reproduction**
1. Go to homepage
2. Click "Trip" link in hero

**Expected**
Navigation to trip planning or discover page

**Actual**
404 — /trip does not exist

**Fix status**
Fixed — changed link to /plan

---

### [BUG-002] Orphan combineWith ID "amathi" in restaurants

**Severity:** High
**Area:** Data
**Page/Component:** src/data/restaurants.ts:63

**Reproduction**
1. View governors-beach-tavernas or any place showing "Combine your day" with this restaurant
2. Or call getRelatedPlaces(["amathi"])

**Expected**
Resolves to Amathus (Amahti) attraction

**Actual**
"amathi" never resolves — correct ID is "amahti"

**Fix status**
Fixed — corrected typo amathi → amahti

---

### [BUG-003] Restaurants combineWith not validated in tests

**Severity:** High
**Area:** Testing
**Page/Component:** src/lib/related-places.test.ts

**Reproduction**
Run related-places tests — they pass despite orphan IDs in restaurants.combineWith

**Expected**
Tests validate all data sources (attractions, trails, wineries, restaurants)

**Actual**
Only allAttractions, trails, wineries included in combineWith validation

**Fix status**
Fixed — added restaurants to test loop

---

### [BUG-004] In-memory rate limits on Vercel serverless

**Severity:** High
**Area:** Security
**Page/Component:** src/lib/rate-limit.ts

**Reproduction**
Multiple serverless instances; each has separate in-memory store

**Expected**
Per-user/IP limits enforced across instances

**Actual**
Per-instance limits; can be bypassed by hitting different instances

**Fix status**
Fixed — Optional Upstash Redis support added. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable shared rate limiting. Falls back to in-memory when unset. Per-route scopes (chat, bookings, etc.) isolate limits.

---

### [BUG-005] Admin stats uses plain back link

**Severity:** Medium
**Area:** UX
**Page/Component:** src/app/admin/stats/page.tsx:98

**Fix status**
Fixed — use BackLink component

---

### [BUG-006] Chat API does not sanitize model reply server-side

**Severity:** Medium
**Area:** Security
**Page/Component:** src/app/api/chat/route.ts:76

**Fix status**
Fixed — sanitize raw reply before returning

---

### [BUG-007] QA_PLAN rate limit numbers mismatch

**Severity:** Low
**Area:** Documentation
**Page/Component:** docs/QA_PLAN.md vs api routes

**Fix status**
Fixed — updated to match actual limits (chat 20/min, bookings 10 POST / 15 GET)

---

## Visual QA — Continuation 1 (Mar 2026)

*From `docs/UX_IMPROVEMENT_PLAN.md` Continuation 1. Team: branding-redesign + ux-polish.*

### P0 — CTA hover inconsistency

| ID | File:Line | Issue | Fix |
|----|-----------|-------|-----|
| BUG-008 | AddToItineraryButton.tsx:29,56 | `hover:bg-terracotta/90` | `hover:bg-terracotta-muted` |
| BUG-009 | AttractionCard.tsx:80 | Same | Same |
| BUG-010 | ItineraryCard.tsx:80 | Same | Same |
| BUG-011 | PlanStickyAddBar.tsx:48 | Same | Same |
| BUG-012 | TemplateChoiceModal.tsx:60 | Same | Same |
| BUG-013 | ClearDayModal.tsx:54 | Same | Same |
| BUG-014 | BookingsEmailLookup.tsx:30 | Same | Same |
| BUG-015 | admin/stats/page.tsx:91 | Same | Same |

**Fix status:** Fixed — all 8 files updated to `hover:bg-terracotta-muted`

---

### P1 — Design system / layout

| ID | File:Line | Issue | Fix |
|----|-----------|-------|-----|
| BUG-016 | [locale]/layout.tsx:66 | `themeColor: "#242528"` hardcoded | Use TOKENS.charcoal |
| BUG-017 | admin/stats/page.tsx:75,130 | Headings lack `font-display` | Add `font-display` |
| BUG-018 | AIAssistant.tsx:463 | Chips use `sage` hover | Use terracotta to match PILL |
| BUG-019 | FilterChips.tsx:20 | Active style differs from PILL | Align with PILL.active or document |
| BUG-020 | HomeHero.tsx:46,53 | Links `min-h-[40px]` | Change to 44px |
| BUG-021 | layout.tsx:102-104, [locale]:115-119 | Footer nav links < 44px | Add min-h-[44px] py-2 inline-flex |
| BUG-022 | search/loading.tsx:19 | Skeleton uses p-4 | Use CARD.content |

**Fix status:** Fixed — themeColor, font-display, AI chips, FilterChips, touch targets (HomeHero, footer), search skeleton

---

### P2 — Minor polish

| Category | File:Line | Issue |
|----------|-----------|-------|
| Colors | TrailDetailStickyActions.tsx:34 | Shadow hardcoded; use token |
| Typography | admin/stats, TrailReportClient | Add font-display to headings |
| Components | RelatedPlacesBlock, events, admin stats | Card border/callout consistency |
| Chips | FilterChips ring-offset, plan chips | Align with PILL tokens |
| Emergency | airport.ts:48,80; layout footer | "112 · 1460 · 199" format; bold numbers |
| Touch | Breadcrumbs.tsx:103 | Add min-h-[44px] |
| Spacing | admin/stats, HomeHero locales | Use SECTION tokens |
| Footer | layout vs [locale] | Unify hover (terracotta vs sage) |
| Components | HomeHero locale CTAs | Use CTA.secondary, CTA.ghost |
| Empty | ErrorState.tsx:42 | Align with EMPTY_STATE/CARD |

**Fix status:** Fixed — Breadcrumbs min-h-[44px] and ErrorState CARD tokens applied.

---

### Summary

| Severity | Count | Next step |
|----------|-------|-----------|
| P0 | 8 | Fixed (Continuation 2) |
| P1 | 7 | Fixed (Continuation 3) |
| P2 | 11 | Fixed (Continuations 4–6) |

Continuation 6 (A11y): Admin input aria-label added; root footer emergency numbers bolded.

---

## Visual QA — Phase 1 (Mar 2026, Best Team UX/UI)

*From UX/UI improvement plan. Team: branding-redesign + ux-polish.*

### P0 — Critical (fix first)

| ID | File | Issue | Fix |
|----|------|-------|-----|
| BUG-023 | messages/en.json:9 | footer.tips missing "· Ambulance 199" | Add full format |
| BUG-024 | messages/de.json:9 | Same | Add "· Krankenwagen 199" |
| BUG-025 | messages/el.json:9 | Same | Add "· Ασθενοφόρο 199" |
| BUG-026 | messages/pl.json:9 | Same | Add "· Ambulans 199" |

**Fix status:** Fixed — footer.tips has full format with bold 112/1460/199 via t.rich.

### P1 — Design system / UX

| ID | File:Line | Issue | Fix |
|----|-----------|-------|-----|
| BUG-027 | layout.tsx:16-25 | Fonts missing `display: 'swap'` | Add to Plus_Jakarta_Sans and Fraunces |
| BUG-028 | regions/[slug]/page.tsx:282, weather/[month]:118, ContextualHelp:145 | border-sand-200 | Use border-sand-200/80 |
| BUG-029 | AIAssistant.tsx (multiple) | border-sand-200 | Use border-sand-200/80 |
| BUG-030 | airport/page.tsx:40-42 | font-bold vs `<strong>` | Align with footer pattern |
| BUG-031 | [locale]/layout.tsx:124 | Locale footer tips vs root | Ensure tips includes 112/1460/199 | Fixed — t.rich with bold |
| BUG-032 | LocaleSelector.tsx:32-50 | Footer select < 44px | Add min-h-[44px] | Fixed — variantClasses already min-h-[44px] |

### P2 — Minor polish

| Category | File:Line | Issue |
|----------|-----------|-------|
| Colors | AllTrailsMap, TrailMap | rgba shadows → design token |
| Typography | install, search, OnboardingModal, _home | text-charcoal vs text-olive consistency |
| Components | airport, discover/[id], BookingsEmailLookup | border-sand-200/80 |
| Tip/Callout | discover/[id] | Define shared CALLOUT token |
| Emergency | airport vs layout | Unify bold pattern |
| Touch | LocaleSelector | 44px touch target |
| Loading | discover/loading.tsx | Skeleton match FilterChips min-h |
| Spacing | HomeHero, install, PageHeader, events | mb-10 vs mb-8, SECTION tokens |
| Card | plan, ErrorState, admin stats | Use CARD.content |

**Fix status:** P0 fixed. P1 done. Phases 4–6 done. ErrorState CARD tokens fixed. Footer/sticky CTA duplication fixed — StickyPlanBarContext hides Plan in BottomNav when sticky bar visible (see docs/FOOTER_STICKY_AUDIT.md). Phase 6/7 verified: skip link (href="#main-content", min-h-[44px]) and main id present; footer emergency format (112/1460/199); touch targets (44px+) on nav, footer, BottomNav, AIAssistantTrigger). Breadcrumbs and ContextualHelp min-h/touch fixes had write denied (manual). Phase 8: lint, test, build all pass.

---

## QA Run — Post UX/UI (Mar 2026)

*Full QA per .cursor/TEAM_QA.md. Shell (lint/test/build) + audit-explore + senior-software-engineer + ux-polish.*

### P0 — None

### P1 — Fix before launch

| ID | Source | Issue | File |
|----|--------|-------|------|
| BUG-033 | audit | Home screen differs from PRD §3.2 (weather-first, trail status, mood) | PRD vs implementation |
| BUG-034 | audit | No API route tests; no E2E tests | — |
| BUG-035 | sse | Chat API exposes `err.message` in 500 responses | api/chat/route.ts:84 |
| BUG-036 | sse | STRESS_TEST_TOKEN bypass in prod if set | rate-limit-shared.ts |
| BUG-037 | ux | Plan `?add=` invalid id → silent redirect, no feedback | plan/page.tsx |
| BUG-038 | ux | AddToItineraryButton touch targets &lt; 44px ("View plan →", AI inline Add) | AddToItineraryButton.tsx |
| BUG-039 | ux | TrailDetailStickyActions may overlap BottomNav on mobile | TrailDetailStickyActions.tsx |

### P2 — Backlog

| Source | Issue |
|--------|-------|
| audit | Chat API may leak internal details in 500 (P2) |
| audit | ~~PRD typography: Inter vs Plus Jakarta Sans~~ | Fixed — PRD updated |
| audit | Root vs [locale] layout — intentional: root for default routes, [locale] for i18n; documented in layout |
| sse | ~~Track API returns 200 when Supabase unavailable~~ | Fixed — returns stored: boolean |
| sse | ~~LD+JSON schema fields~~ — documented in src/lib/schema-ldjson.ts; fields from src/data/ |
| ux | ~~Unknown `?filter=` shows all without feedback~~ | Fixed — shows "Unknown category — showing all" |

**Fix status:** BUG-035–039 fixed. BUG-034 fixed. BUG-033 fixed — PRD §3.2 home alignment: weather strip, search ("Where to today?"), Explore by mood, Winter Insider Tip. This week + Editor's picks cover Today's Picks; StickyPlanBar = Your Itinerary.

---

## Home Page Visual Fixes (Mar 2026)

*Plan: home_page_visual_fixes. Team: branding-redesign + ux-polish.*

### Applied

| Fix | File |
|-----|------|
| Remove rounded-2xl (align with CARD.base rounded-xl) | StartHereStrip, ThisWeekGrid, EditorsPicks, BookTastings, WhyCyprusDetails |
| Use CALLOUT.tip for Winter Insider Tip | HomeInsiderTip.tsx |
| Add LAYOUT.safeAreaX for notched devices | TripReminderBanner.tsx |
| Remove px-4 sm:px-6 override on search section | page.tsx |
| Remove py-2 from AddToItineraryButton (preserve 44px touch target) | EditorsPicks, ThisWeekGrid |

### Deferred — now fixed

| Fix | File |
|-----|------|
| Clear button 44px touch target | RecentlyViewed.tsx — added min-w-[44px], px-3, focus-visible ring |

**Verify:** lint, test, build all pass.

---

## Project Review and Soul (Mar 2026)

*Plan: project_review_and_soul. Team: audit-explore, senior-software-engineer, ux-polish, branding-redesign, content-polish.*

### Phase 1 — Audit findings (summary)

- **Security P1:** Redis for rate limiting in production (UPSTASH_REDIS_REST_*)
- **Security P0:** Weather/VAPID routes lack rate limiting; bookings lookup by email without auth
- **Content/UX:** ErrorState emojis, onboarding copy, AI error messages, empty states

### Phase 2–3 — Soul fixes applied

| Fix | File |
|-----|------|
| Remove emojis; use IconAccent (colored bar) | ErrorState.tsx |
| Shorten rate-limit and network error copy | ErrorState.tsx |
| Warmer onboarding step descriptions | OnboardingModal.tsx |
| Shorten AI greeting; user-facing auth/rate-limit errors | AIAssistant.tsx |
| "Type at least 2 characters" | SearchBar.tsx |
| Softer plan add=failed message | plan/page.tsx |
| "No bookings for that email" (not address) | bookings/page.tsx |
| Remove wine emoji; use accent bar | bookings/page.tsx |
| Search no-results: echo query | search/page.tsx |
| PlacePicker empty: Troodos, Omodos hint | PlacePicker.tsx |
| Discover empty: Add Ask AI button | DiscoverClient.tsx |

### Deferred / backlog

- P1: Configure Redis in production
- P0: Add rate limiting to Weather/VAPID
- P2: Lint (BeforeYouGoChecklist, OnboardingModal effect deps)

---

## UX/UI Top Areas Polish (Mar 2026)

*Plan: ux_ui_top_areas_polish. Team: ux-polish + branding-redesign.*

### Applied

| Fix | File(s) |
|-----|---------|
| Search results block (critical bug fix) | search/page.tsx, SearchResultCard.tsx |
| Discover hero CTA, TYPE.sectionTitle for section headings | discover/page.tsx, DiscoverClient.tsx |
| Home StartHereStrip overlap reduced, HomeMoodStrip TYPE.sectionTitle | StartHereStrip.tsx, HomeMoodStrip.tsx |
| Plan quick-add chips PILL tokens, Start here TYPE.sectionTitle | plan/page.tsx |
| Trails hero CTA, stats card spacing, TYPE.sectionTitle | TrailsClient.tsx |
| Events filter URL params (?type=&region=), TYPE.sectionTitle | events/page.tsx |
| Regions section titles TYPE.sectionTitle + SECTION.headingGap | regions/[slug]/page.tsx |

**Verification:** lint pass, build pass. Cross-page: hero CTAs on Discover/Trails/Events; section titles use TYPE.sectionTitle; Search results render when q.length>=2.

---

## Next Priority Decision (Mar 2026)

*Plan: next_priority_decision. Post–UX Polish priorities.*

### Batch 1 — Lint debt (P2)

| Fix | File |
|-----|------|
| setState in effect — use queueMicrotask to defer | BeforeYouGoChecklist.tsx, OnboardingModal.tsx |
| Add ids to useEffect deps | BeforeYouGoChecklist.tsx |

**Fix status:** Fixed — lint passes with zero warnings.

### Batch 2 — Weather/VAPID rate limiting (P0)

| Fix | File |
|-----|------|
| Add rate limit 30/min | api/weather/route.ts |
| Add rate limit 10/min | api/push/vapid/route.ts |
| Add scopes "weather", "vapid" | lib/rate-limit.ts |

**Fix status:** Fixed — both routes protected.

---

## CPO + Design App Completion (Mar 2026)

*Plan: cpo_and_design_app_completion. CPO conversion, Plan CTA parity, messaging, design tokens, loading polish.*

### Implemented

| Batch | Fix | File(s) |
|-------|-----|---------|
| 1 | Install page noindex | install/page.tsx — `robots: { index: false, follow: false }` |
| 2 | Secrets Plan CTA in header | secrets/page.tsx — added "Plan your trip" in PageHeader children |
| 5 | Loading for dynamic routes | wine-routes/[slug]/loading.tsx, regions/[slug]/loading.tsx, weather/[month]/loading.tsx |
| 5 | PlacePicker empty-state copy | PlacePicker.tsx — contextual copy for search vs category-empty |
| 5 | Bottom nav parity | nav-links.ts — added Secrets and Team to bottomOverflowLinks |

**Note:** Search, Discover, Events, Plan (Book tastings), Trail detail (Book a guide), Trail report success, Wineries already had Plan/Book CTAs. Home hero already has "Often sixteen degrees when home is six." Breadcrumbs links already have min-h-[44px]. ErrorState uses CARD tokens. Emergency numbers use `<strong>` on airport, not-found, error, trails pages.

**Verification:** `npm run lint` passes. `npm run build` may hit Next.js 16 pages-manifest.json ENOENT (pre-existing; investigate separately).

---

## QA Run — Routes & Bugs (Mar 7, 2026)

*Per plan: shell (lint/test/build) + audit-explore + senior-software-engineer. Focus: API routes and bugs.*

### Automated checks

| Check | Result | Notes |
|-------|--------|-------|
| npm run lint | Pass | 1 warning (unused CTA import in discover/page.tsx) — fixed |
| npm run test | Pass | 146 tests |
| npm run build | Pass | Next.js 16.1.6 |

### P0 — Critical

| ID | Source | Issue | File |
|----|--------|-------|------|
| BUG-040 | sse | AI output: `javascript:` links only partially mitigated — server-side `sanitizeText` does not strip dangerous protocols in markdown links | src/lib/sanitize.ts, src/components/AIAssistant.tsx |

### P1 — High

| ID | Source | Issue | File |
|----|--------|-------|------|
| BUG-041 | audit | Redis in production — set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for shared rate limiting | docs/QA_PLAN.md, src/lib/rate-limit.ts |
| BUG-042 | sse | `sanitizeText` does not strip dangerous protocols in markdown links (e.g. `[Click](javascript:alert(1))`) | src/lib/sanitize.ts:7-15 |
| BUG-043 | sse | Chat context `path` and `lastPlace` lack `.max()` — very long values could increase latency/cost | src/lib/chat-schema.ts:10-15 |
| BUG-044 | sse | Weather API: invalid lat/lng returns 200 with fallback instead of 400 | src/app/api/weather/route.ts:23-37 |

### P2 — Medium

| ID | Source | Issue | File |
|----|--------|-------|------|
| BUG-045 | audit | Health does not check Resend connectivity | src/app/api/health/route.ts:21-52 |
| BUG-046 | audit | Cron 500 responses expose `err.message` in production | src/app/api/cron/weather-digest/route.ts:76, src/app/api/cron/daily/route.ts:75 |
| BUG-047 | audit | Cron routes have no rate limiting (CRON_SECRET auth only) | src/app/api/cron/* |
| BUG-048 | audit | Push subscribe: `p256dh` and `auth` have no max length | src/app/api/push/subscribe/route.ts:8-21 |
| BUG-049 | audit | Right-now: fail-open on rate limit error (allow request if Redis fails) | src/app/api/right-now/route.ts:52-56 |
| BUG-050 | audit | Response shape inconsistency — Weather/right-now use different error shape vs jsonError() | src/app/api/weather/route.ts, src/app/api/right-now/route.ts |

### Verified (no change needed)

| Check | Status |
|-------|--------|
| Booking lookup exact match | OK |
| Chat rate limit 20/min prod | OK |
| Bookings rate limit (10 POST / 15 GET) | OK |
| Trail reports Zod validation | OK |
| Resend email escaping | OK |
| Admin stats 401 without secret | OK |
| AI client-side `isSafeUrl` for links | OK |
| Chat 500 hides internals in production | OK |

### Fix status

Fixed — BUG-040, BUG-042 (sanitizeMarkdownLinks in sanitize.ts); BUG-043 (chat-schema path/lastPlace .max(256)); BUG-044, BUG-050 (weather API 400 for invalid lat/lng, jsonError for 503/500); BUG-046 (cron routes hide err.message in prod); BUG-048 (push subscribe p256dh/auth .max(200)). BUG-041 documented in VERCEL_DEPLOY_CHECKLIST and .env.example. BUG-045, BUG-047, BUG-049 deferred per plan.

---

## SERP Flows Quality Audit (Mar 7, 2026)

*Plan: SERP Flows and Page Ordering — 200% Quality. Team: seo-copywriter, content-polish, audit-explore, ux-polish, senior-software-engineer.*

### Implemented

| Phase | Change | File(s) |
|-------|--------|---------|
| 1 | OpenGraph for beaches, villages, wineries, search, airport, secrets, weather | beaches/page.tsx, villages/page.tsx, wineries/page.tsx, search/page.tsx, airport/page.tsx, secrets/page.tsx, weather/page.tsx |
| 1 | Bookings noindex (user dashboard) | bookings/layout.tsx |
| 2 | ItemList LD+JSON for beaches, villages, wineries | beaches/page.tsx, villages/page.tsx, wineries/page.tsx |
| 2 | Events OpenGraph; ItemList schema already present | events/layout.tsx |
| 3 | Remove bookings from sitemap (noindex) | sitemap.ts |
| 3 | robots.txt: disallow auth paths | robots.ts |
| 4 | Remove unused HomeRightNowStrip | _home/HomeRightNowStrip.tsx (deleted) |
| 6 | Fix unused CARD import | trails/TrailsClient.tsx |

### Decisions

- **Search:** Kept indexable — "search Cyprus winter" intent; base /search is useful landing page.
- **HomeRightNowStrip:** Deleted; page uses RightNowNearYou (consent-first design).

### Verification

| Check | Result |
|-------|--------|
| npm run lint | Pass (0 warnings) |
| npm run test | Pass (146 tests) |
| npm run build | Pass (Next.js 16.1.6) |

**Fix status:** Complete.

---

## Anomaly Audit (Mar 8, 2026)

*Per plan: audit src/ for inconsistencies, data integrity, design tokens, duplicate patterns.*

### BUG-053 — natureSites omitted from allDiscoverItems

**Severity:** Medium
**Area:** Data
**Page/Component:** src/app/(padded)/discover/page.tsx

**Reproduction**
1. Open /discover
2. Filter by "Family-friendly" or "Off the beaten path"
3. Check which places appear

**Expected**
Family-friendly or off-beaten-path nature sites (e.g. Cape Greco, Lara Bay) appear in those sections.

**Actual**
`allDiscoverItems` excluded `natureSites`, so `familyItems` and `quietItems` were built without nature sites. Nature section worked (it uses `natureSites` directly), but Family-friendly and Quiet escapes missed nature sites. JSON-LD schema also omitted nature sites.

**Fix status**
Fixed — added `natureSites` to `allDiscoverItems` array.

### Audit summary

| Check | Result |
|-------|--------|
| Design tokens | OK — TOKENS, LAYOUT, CARD used; hex only in design-tokens.ts and globals.css |
| combineWith IDs | OK — related-places.test.ts validates all sources |
| Filter params | OK — filterToSectionId matches discover sections |
| Slugs | OK — wine-routes, regions slugs validated |
| Duplicate chip data | Low — CategoryChips and StartHereWithExplore share similar arrays; acceptable |

---

## CTO Project Review — Mar 2026

*Plan: CTO Project Review and Action Plan. Phases 1–6 + P0 actions.*

### Phase 1 — Automated Baseline

| Check | Result |
|-------|--------|
| npm run lint | Pass |
| npm run test | Pass (148 tests) |
| npm run build | Pass (Next.js 16.1.6) |
| npx tsc --noEmit | Pass (excluded .next/dev/types/validator.ts) |
| npm run stress:api | Run (requires dev server; rate limits verified) |

### Phase 2–3 — Architecture & Security

- New components (RightNowNearYou, HomeTrailConditionsStrip, TrailFilters) use LAYOUT, STRIP, design tokens
- Booking lookup: exact match via .eq("guest_email", emailNormalized)
- Sanitization: sanitizeMarkdownLinks blocks javascript:, data: in AI output
- rate-limit-shared: STRESS_TEST_TOKEN bypass disabled when NODE_ENV=production

### Phase 4 — Functional Flows

- Section order in page.tsx matches HOME_REDESIGN_SPEC §1
- Discover→Detail, Plan→Book, Trails→Report, Bookings sync, AI chat, Search, RightNow flows implemented

### Phase 5–6 — UX & Docs

- RecentlyViewedStrip: aria-labelledby present
- VERCEL_DEPLOY_CHECKLIST: P0 launch blockers (Redis, STRESS_TEST_TOKEN) documented
- .env.example: STRESS_TEST_TOKEN "Never set in production" note added

### P0 Actions Implemented

| # | Action | Status |
|---|--------|--------|
| 1 | Redis config | Documented in VERCEL_DEPLOY_CHECKLIST §5 |
| 2 | HOME_REDESIGN_SPEC §1 | Section order already correct |
| 3 | HomeRightNowStrip | Already deleted (uses RightNowNearYou) |
| 4 | STRESS_TEST_TOKEN | Code returns false in prod; .env.example clarified |

### P1 Implemented

| # | Action | Status |
|---|--------|--------|
| 5 | Health: Resend connectivity check | Added optional fetch to api.resend.com/domains; returns resend: ok\|error\|not configured |

---

## Right Now Near You Bug Fixes (Mar 7, 2026)

### BUG-051 — useEffect re-runs when toggling Closer/Farther

**Severity:** High
**Area:** Functional
**Page/Component:** RightNowNearYou

**Reproduction**
1. Consent, use location, load feed
2. Toggle "Farther"

**Expected**
Refetch with expanded radius only; no geolocation re-prompt

**Actual**
`handleUseLocation` in effect deps; effect re-ran on `distanceMode` change and triggered geolocation again

**Fix status**
Fixed — effect deps changed to `[]`; runs only on mount for consent check.

### BUG-052 — No way back from region picker to use location

**Severity:** Medium
**Area:** UX
**Page/Component:** RightNowNearYou

**Reproduction**
1. Click "Pick a region"
2. See region chips; want to use GPS instead

**Expected**
Option to switch to "Use my location"

**Actual**
No escape; must refresh or pick a region

**Fix status**
Fixed — added "Use my location instead" link in region picker.

---

## CTO Verification (Mar 7, 2026)

*Act-as-CTO pass: lint, test, build; deferred items confirmed.*

### Automated baseline

| Check | Result |
|-------|--------|
| npm run lint | Pass |
| npm run test | Pass (148 tests) |
| npm run build | Pass (Next.js 16.1.6) |

### Verified fixed

- BUG-045: Health Resend connectivity — implemented (api/health fetches api.resend.com/domains)
- Breadcrumbs: min-h-[44px] on Link present
- ContextualHelp: min-h-[44px] on dismiss button present
- ErrorState: CARD.base, CARD.content, IconAccent
- TrailDetailStickyActions: bottom offset above BottomNav on mobile
- Right Now: BUG-051, BUG-052 fixed

### Deferred (by design)

- BUG-047: Cron rate limiting — CRON_SECRET auth; rate limit redundant
- BUG-049: Right-now fail-open — availability over strict rate limit when Redis fails
- BUG-041: Redis — documented in VERCEL_DEPLOY_CHECKLIST; config, not code

---

## QA Run — (padded) Layout Refactor Verification (Mar 8, 2026)

*Post refactor: non-home routes in app/(padded)/ with nav clearance; home pt-0 for hero flush.*

### Automated checks

| Check | Result | Notes |
|-------|--------|-------|
| npm run lint | Pass | 0 errors |
| npm run test | Pass | 150 tests |
| npm run build | Pass | Next.js 16.1.6 |

### (padded) layout structure verified

| Route | Layout chain | Nav clearance |
|-------|--------------|---------------|
| / (root home) | Root layout (main pt-0) | Hero flush under nav ✓ |
| /discover, /trails, /plan (root) | Root → (padded) layout (div pt) | Correct ✓ |
| /en, /el, etc. (locale home) | [locale] layout (main pt) | Correct ✓ |
| /en/discover, /en/trails, etc. | [locale] layout (main pt) | Correct ✓ |

### Fix status

No bugs found. All QA_BUGS entries remain Fixed. Layout refactor verified; discover, trails, plan pages use correct spacing via (padded) or [locale] main padding.

---

## QA Run — Bug Audit (Mar 8, 2026)

*Per plan: shell (lint/test/build) + bug pattern scan. Team: bug-fix.*

### Automated checks

| Check | Result | Notes |
|-------|--------|-------|
| npm run lint | Pass | 0 errors |
| npm run test | Pass | 150 tests |
| npm run build | Pass | Next.js 16.1.6 |
| npx tsc --noEmit | Pass | Fixed (see below) |

### Bug pattern scan

| Pattern | Result |
|---------|--------|
| Broken imports | None — all imports resolve correctly |
| console.error leaks | API routes/lib only (acceptable); components clean |
| Type errors | Fixed: tsconfig exclude for `.next/dev/types/app` |
| Hydration | suppressHydrationWarning on body (intentional) |
| Broken links | None — no /trip; all hrefs point to valid routes |

### Fix applied

**tsconfig.json — tsc failing on .next/dev/types**

- **Cause:** Next.js 16 generated `.next/dev/types/app/**` files reference paths like `src/app/airport/page.js`; routes live under `(padded)/`, so those paths don't exist.
- **Fix:** Added `.next/dev/types/app` to tsconfig `exclude` so `npx tsc --noEmit` passes. Build unaffected (Next.js uses its own checker).

### QA_BUGS status

No Open or In progress bugs. All prior entries Fixed.

---

## Audit — Comprehensive Issue Scan (Mar 8, 2026)

*Per plan: audit-explore. Categories: Bugs, Accessibility, Inconsistencies, Performance, Security, Data, UX, SEO.*

### P0 — Critical (fix first)

| ID | File | Issue |
|----|------|-------|
| — | — | No P0 issues found |

### P1 — High

| ID | Category | File | Issue |
|----|----------|------|-------|
| BUG-054 | SEO | src/app/layout.tsx | Root layout metadata lacks `alternates: { canonical: SITE_URL }`; home `/` has no canonical |
| BUG-055 | Accessibility | Multiple | Footer/secondary `Link` with `text-aegean hover:underline` lack `min-h-[44px]` (wine-routes, regions, book/guide, guides, secrets, beaches, villages, wineries) |
| BUG-056 | Accessibility | plan/page.tsx:295–305 | Inline "Or" links (`font-medium text-aegean hover:underline`) lack min-h-[44px] |
| BUG-057 | UX | AIAssistant.tsx:645 | AI markdown links with `href="#"` when `!isSafeUrl` — renders as link but navigates nowhere; consider hiding or showing as plain text |

### P2 — Medium

| ID | Category | File | Issue |
|----|----------|------|-------|
| BUG-058 | Inconsistency | PageHeader vs BackLink | PageHeader uses plain Link with back styling; BackLink is separate component — both acceptable but pattern differs |
| BUG-059 | Inconsistency | DiscoverClient:133 | "Clear region" link has `min-h-[44px]`; "Unknown category" link at 113 lacks it |
| BUG-060 | Performance | page.tsx | EditorsPicks, BookTastings dynamically imported with loading skeletons — OK |
| BUG-061 | Security | .env.example | API keys documented; no hardcoded secrets in src/ |
| BUG-062 | Data | related-places.test.ts | combineWith validation covers all sources; no orphan IDs found |
| BUG-063 | UX | plan/page.tsx | `?add=failed` shows alert; `?add=` with invalid id redirects to failed — OK |
| BUG-064 | SEO | layout.tsx | Root has openGraph.url; sub-pages have canonical — home canonical missing (see BUG-054) |
| BUG-065 | Accessibility | AIAssistant | Modal has aria-modal, aria-labelledby; backdrop tap dismiss on mobile — no focus trap (Escape closes); consider focus trap for keyboard users |
| BUG-066 | Design | globals.css, design-tokens.ts | Hex only in design system files — OK |

### Verified (no change needed)

| Check | Status |
|-------|--------|
| combineWith IDs | related-places.test.ts validates attractions, trails, wineries, restaurants |
| filterToSectionId | Matches discover sections (beach, nature, ancient, village, winery, eat, monastery, family, quiet) |
| Back navigation | PageHeader or BackLink on detail pages; PageHeader on list pages (secrets, discover, wine-routes, etc.) |
| sanitizeText + sanitizeMarkdownLinks | Chat API applies before returning; AIAssistant uses isSafeUrl for href |
| Rate limiting | Chat, bookings, weather, vapid documented; STRESS_TEST_TOKEN disabled in prod |
| Touch targets (CTAs) | AddToItineraryButton, CTA tokens, Nav, BottomNav, BackLink use min-h-[44px] |
| LD+JSON | Static schema from data; dangerouslySetInnerHTML with JSON.stringify — safe (no user input) |

### Fix status

No P0 fixes applied (none identified). P1/P2 documented for backlog.

---

## Bug Fix Run — P1 Accessibility & UX (Mar 8, 2026)

*Fix BUG-054, BUG-055, BUG-056, BUG-057, BUG-059.*

### Fixes applied

| ID | Fix |
|----|-----|
| **BUG-054** | Added `alternates: { canonical: SITE_URL }` to root layout metadata |
| **BUG-055** | Added `SECTION.aegeanLink` token (44px touch target) and applied to guides, villages, wineries, book/guide, secrets, wine-routes, beaches, regions, weather, register; footer already had min-h-[44px] |
| **BUG-056** | Plan page "Or" links now use `SECTION.aegeanLink` |
| **BUG-057** | AIAssistant: when `!isSafeUrl`, render `<span>` instead of `<a href="#">` |
| **BUG-059** | DiscoverClient "All categories" link now uses `SECTION.aegeanLink` |
| **BUG-065** | No fix — focus trap already implemented (Tab/Shift+Tab + focusin) |

---

## Bug Fix Run — Build Failure (Mar 8, 2026)

*Per plan: shell (lint/test/build) + bug scan. Team: bug-fix.*

### Build failure fixed

| ID | Severity | Issue | Fix |
|----|----------|-------|-----|
| **BUG-066** | Critical | Prerender `/en/events`: `ReferenceError: ConversionTracker is not defined` | ConversionTracker client component referenced during SSG; wrapped in ConversionTrackerClient that dynamically imports with `ssr: false`. Created `src/components/ConversionTrackerClient.tsx`; root layout now imports and renders ConversionTrackerClient. |

### Verification

| Check | Result |
|-------|--------|
| npm run lint | Pass |
| npm run test | Pass (150 tests) |
| npm run build | Pass (Next.js 16.1.6, 523 static pages) |

---

## CTO Fix Run (Mar 8, 2026)

### BUG-067 — useItinerary removeFromDay crash when prev[activeDay] undefined

**Severity:** High  
**Area:** Functional  
**Page/Component:** src/hooks/useItinerary.ts:92

**Reproduction**
Edge case: removeFromDay called when day was never populated (state corruption or race).

**Expected**
Filter runs on array; no crash.

**Actual**
`prev[activeDay].filter` throws when prev[activeDay] is undefined.

**Fix status**
Fixed — use `(prev[activeDay] ?? []).filter(...)` to guard against undefined.

---

## QA Run — CTO Lead (Mar 8, 2026)

*Per plan: shell (lint/test/build) + top-bar overlap audit + list pages review + accessibility check.*

### 1. Automated checks

| Check | Result | Notes |
|-------|--------|-------|
| npm run lint | Pass | 0 errors |
| npm run test | Pass | 150 tests |
| npm run build | Pass | Next.js 16.1.6, 523 static pages |

### 2. Top-bar overlap on mobile — audit of recent fixes

| Component | Status | Notes |
|-----------|--------|-------|
| **ListPageHero** | ✓ Fixed | Overlay content uses `pt-[calc(3.5rem+env(safe-area-inset-top,0px))]` so back link, title, description sit below nav |
| **ListPageWidgetStrip** | ✓ Fixed | Sticky strip uses `top-[calc(3.5rem+env(safe-area-inset-top,0px))]` when `sticky` |
| **DaySelector** | ✓ Fixed | Sticky uses `sm:top-[calc(3.5rem+env(safe-area-inset-top,0px))]` when `hasContent` |
| **TrailDetailStickyActions** | ✓ Fixed | `max-md:bottom-[calc(5.5rem+env(safe-area-inset-bottom))]` sits above BottomNav |
| **(padded) layout** | ✓ OK | `pt-[calc(3.5rem+env(safe-area-inset-top,0px))]` for nav clearance |

No regressions found. Nav clearance (3.5rem ≈ h-14) and safe-area-inset applied consistently.

### 3. List pages (events, discover, trails, plan) — visual/UX issues

| Page | Finding | Severity |
|------|---------|----------|
| **Trails** | BUG-068: `trails-plan-sentinel` is never rendered. StickyPlanBar observes it; sentinel missing → StickyPlanBar never shows. | Medium |
| **Trails** | BUG-069: Fixed bottom "Add to plan" bar is at `z-20`; BottomNav is `z-40`. Bar is hidden behind BottomNav on mobile. User sees redundant Plan in BottomNav but prominent CTA is obscured. | Medium |
| **Events** | Month jump links use CTA.chipTertiary (44px) ✓; filters collapsible with aria-expanded ✓ | — |
| **Discover** | Sticky bar and sentinel (discover-plan-sentinel) present ✓ | — |
| **Plan** | DaySelector sticky, ListPageWidgetStrip, sentinels OK ✓ | — |

### 4. Accessibility (focus, aria, contrast)

| Check | Result |
|-------|--------|
| **Touch targets** | CTA, FilterChips, ListPageHero back link, DaySelector tabs use min-h-[44px] ✓ |
| **Focus** | focus-visible rings on buttons, links; focus order follows DOM ✓ |
| **ARIA** | Events: aria-expanded, aria-controls, aria-labelledby on filters and sections ✓; aria-live on empty states ✓ |
| **Contrast** | Design tokens (olive on sand) — verify with axe DevTools; recommend Lighthouse a11y pass |

**P2 note:** Events "Jump to month" links use `CTA.chipTertiary` — no explicit aria-label on individual links; href to `#month-X` is self-describing.

### 5. Summary

| Category | Result |
|----------|--------|
| **Automated** | All pass |
| **Top-bar overlap** | No regressions; fixes verified |
| **List pages** | 2 issues on Trails (missing sentinel, bar overlap) |
| **Accessibility** | Touch targets and ARIA generally good; contrast not instrument-tested |

**Fix status**

- BUG-068: Fixed — added `<div id="trails-plan-sentinel">` after hero so StickyPlanBar can observe scroll.
- BUG-069: Fixed — trails fixed bar now uses `bottom-[calc(5.5rem+env(safe-area-inset-bottom))]` on mobile (above BottomNav) and `z-30` for correct stacking.

---

## QA Run — QA Experts Team (Mar 9, 2026)

*Per .cursor/TEAM_QA.md. Shell (lint/test/build) + audit-explore + senior-software-engineer + ux-polish.*

### Automated baseline

| Check | Result | Notes |
|-------|--------|-------|
| npm run lint | Pass | 0 errors (fixed daily-rotator.test.ts readonly type + unused var) |
| npm run test | Pass | 172 tests |
| npm run build | Pass | Next.js 16.1.6 |
| npx tsc --noEmit | Pass | Fixed daily-rotator.test.ts items typing |

### Fix applied (automated)

- **daily-rotator.test.ts** — items array: removed `as const`, typed as `{ id: string; type: string }[]`; removed unused `promoted` var. Resolves tsc errors and lint warning.

### P0 — Critical

| ID | Source | Issue | File |
|----|--------|-------|------|
| BUG-070 | sse | XSS via entity-encoded markdown links — `[x](&#106;avascript:alert(1))` bypasses sanitization | src/lib/sanitize.ts, src/lib/safe-url.ts |

### P1 — High

| ID | Source | Issue | File |
|----|--------|-------|------|
| BUG-071 | audit | Redis not configured in production — in-memory rate limits per-instance | src/lib/rate-limit.ts |
| BUG-072 | sse | right-now fail-open on rate-limit error — allows request when Redis fails | api/right-now/route.ts |
| BUG-073 | sse | Track API lacks Zod validation for body | api/track/route.ts |
| BUG-074 | ux | Toast dismiss button 32×32px (below 44px) | src/components/ui/Toast.tsx:79 |
| BUG-075 | ux | account "Skip — use my plan" link lacks min-h-[44px] | account/page.tsx:123 |
| BUG-076 | ux | admin/stats loading state text-only, no skeleton | admin/stats/page.tsx:107-108 |

### P2 — Medium (backlog)

| Source | Issue |
|--------|-------|
| audit | USER_FLOWS_AZ.md primaryLinks outdated vs nav-links |
| audit | ACTION_PLAN manual QA, partner outreach pending |
| ux | SiteFooter emergency numbers format vs error/not-found |

### Fix status (Mar 9, 2026)

- **BUG-070:** Fixed — decode HTML entities in sanitize.ts and safe-url.ts; regex consumes trailing `)+`; tests added.
- **BUG-072:** Fixed — right-now API returns 503 when rateLimit() throws.
- **BUG-073:** Fixed — Track API Zod schema (trackBodySchema); z.record(key, value); error.issues.
- **BUG-074:** Fixed — Toast dismiss button now uses `min-h-[44px] min-w-[44px]` (CTO fix run).
- **BUG-075:** Fixed — Account Skip link has min-h-[44px] and focus-visible ring.
- **BUG-076:** Fixed — Admin stats loading uses SKELETON and sr-only status.

---

## TEAM-AGENTS Full Pass — May 9, 2026

*Per `.cursor/TEAM_APP_EXPERTS.md` simulation: **audit-explore** (PRD + security + funnel), **ux-polish** (overlay + Plan/Book mobile matrix), **seo-copywriter** (sample locale pages), **shell** (lint / typecheck / test / build / `test:e2e:core-funnel:ci`).*

### Automated baseline

| Check | Result | Notes |
|-------|--------|-------|
| `npm run lint` | Pass | |
| `npm run typecheck` | Pass | |
| `npm run test` | Pass | 61 files, 477 tests (Vitest) |
| `npm run build` | Pass | Next.js 16.1.6 (Turbopack) |
| `npm run test:e2e:core-funnel:ci` | Pass | 24 tests across `chromium` + `mobile-chrome` (after browser install — see below) |

**E2E toolchain note:** First local run failed with `browserType.launch: Executable doesn't exist` for Playwright Chromium (cache path empty). After `npx playwright install chromium`, **all 24** core-funnel tests passed (desktop + mobile viewport). CI typically installs browsers during setup; document this for fresh clones so contributors do not assume a green path without `playwright install`.

### audit-explore — PRD, security, funnel

| Area | Finding | Severity |
|------|---------|----------|
| PRD vs product | `PRD.md` / Super PRD are strategy-heavy; `PRODUCT_DEEP.md` + route map match the implemented Discover → Plan → Book funnel; no contradiction in spot-check | Info |
| Cron / admin auth | `src/app/api/cron/daily/route.ts` and `weather-digest/route.ts` require `CRON_SECRET` + `Authorization: Bearer`; `api/stats` and admin session use `ADMIN_SECRET` — server-only env, not exposed to client | Info |
| Prior backlog | BUG-071 (Redis-backed rate limits in prod) remains a deployment concern if production still uses in-memory limits | Backlog (see Mar 9 QA) |
| Doc drift | `PRODUCT_DEEP.md` §6 still references `AIAssistant.tsx`; implementation uses `AIAssistantWithBoundary` + dynamic import from `ClientComponents.tsx` | Low |
| Funnel coverage | E2E core funnel (`arrival-decision-flow`, `discover-plan`, `plan-book`, `bookings`, `locale-prefixed-route`) — **24/24** across `chromium` + `mobile-chrome` after browser install | Info |

### ux-polish — overlays + Plan/Book mobile matrix

| Area | Finding | Severity |
|------|---------|----------|
| Overlay stack | `ClientComponents.tsx`: CookieConsentBanner mounts immediately after hydration; AI + OnboardingModal deferred to `window.load` to protect LCP — aligns with performance goals | Info |
| Blocking overlays | `useBlockingOverlaysActive` + `data-overlay` on cookie/onboarding — consistent with prior UX hardening | Info |
| Mobile matrix | `playwright.config.ts` runs the core funnel on **Desktop Chrome** and **mobile-chrome** (`Pixel 7`). Touch targets / BottomNav / safe-area coverage now has Playwright smoke coverage, with broader manual matrix still tracked in `docs/UX_UI_RESPONSIVE_MATRIX.md` | Info |

### seo-copywriter — sample locale pages

| Area | Finding | Severity |
|------|---------|----------|
| Strategy A | `src/app/[locale]/layout.tsx` — `generateMetadata` uses `buildStrategyAAlternates`, `meta.homeTitle` / `homeDescription` from `next-intl` messages | Info |
| Sitemap | `src/app/sitemap.ts` documents canonical unprefixed URLs only — consistent with `docs/INTERNATIONAL_SEO.md` Strategy A | Info |
| robots | `src/app/robots.ts` disallows auth/account and `/api/` for all agents; allows `/` — locale-prefixed auth paths included in disallow patterns | Info |

### P3 — Low / process / backlog (this pass)

| ID | Source | Issue | File / action |
|----|--------|-------|----------------|
| BUG-077 | shell | Fresh machine: core-funnel E2E fails until `npx playwright install chromium` (or full `playwright install`) — add to onboarding / `docs/QA_PLAN.md` or optional `postinstall` | Process |
| BUG-078 | ux | Core-funnel E2E lacked mobile viewport — Plan/Book mobile matrix not automated | `playwright.config.ts` + `e2e/discover-plan.spec.ts` (fixed: `Pixel 7` / `mobile-chrome`, BottomNav Plan assertion) |
| BUG-079 | audit | `PRODUCT_DEEP.md` §6 path references legacy `AIAssistant.tsx` | Doc update |

### Fix status (May 9, 2026)

- Automated gate: **lint, typecheck, test, build** — all pass.
- **Core-funnel E2E:** **24/24** pass after local Playwright Chromium install.
- BUG-077–079: **Fixed** — `npm run test:e2e:install` + QA_PLAN prerequisites (BUG-077); `playwright.config.ts` **mobile-chrome** project (`Pixel 7`, Chromium viewport) for core-funnel specs only — avoids WebKit-only install/crash in constrained envs (BUG-078); `PRODUCT_DEEP.md` §6 AI paths updated (BUG-079).

---

## UX/UI Refinement Program — May 16, 2026

*Full implementation per platform refinement plan: `HubFooter`, `DetailActionFooter`, overlay a11y, home IA, discover map tab, i18n keys. See `docs/UX_PATTERNS.md` and `docs/QA_PLAN.md` (hub footer / funnel parity row).*

### Automated baseline

| Check | Result | Notes |
|-------|--------|-------|
| `npm run lint` | Pass | |
| `npm run build` | Pass | Next.js production build |
| `npm run test` | Pass | 478 Vitest (prior run) |
| `npm run i18n:validate` | Pass | After syncing 24 UX keys to `el`, `de`, `pl` |
| `npm run test:e2e:local` (UX subset) | Pass | 10/10 — `hub-footer`, `overlay-precedence`, `discover-detail`, `discover-plan` |

### Backlog / watch

| ID | Area | Issue | Severity |
|----|------|-------|----------|
| BUG-080 | E2E | `arrival-decision-flow` desktop hero → `/airport` navigation occasionally flaky | Fixed — `scrollIntoViewIfNeeded` + `waitForURL` race; **35/35** full suite May 16 |
| — | i18n | New strings added to all locales; DE/PL copy is functional—native polish pass optional | Info |

---

## Visual QA — Full pass (May 16, 2026)

*Team: branding-redesign + ux-polish + automated gates per `docs/QA_PLAN.md` §2.6 and `.cursor/TEAM_VISUAL_QA.md`.*

### Automated baseline

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm run test` | Pass (473) |
| `npm run build` | Pass |
| `npm run i18n:validate` | Pass (1342 keys, 4 locales) |

### Findings fixed (BUG-081–086)

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| BUG-081 | Layout | `HubFooter` duplicated mobile bottom clearance (`footerBottomClearance` + `main` padding) — excessive gap above site footer | Removed `footerBottomClearance` from `HubFooter`; documented in `docs/UX_PATTERNS.md` |
| BUG-082 | Funnel | Events page lacked `HubFooter`; hardcoded EN copy; sticky sentinel on filter strip (Plan bar showed too early) | `HubFooter` + i18n; sentinel moved to page footer; empty-filter state gets footer |
| BUG-083 | Funnel | Search, regions, wine-routes used ad-hoc footer links vs `HubFooter` | Migrated to `HubFooter` + i18n keys |
| BUG-084 | Overlays | `ToastContainer` at `z-[100]` competed with onboarding | `LAYER.toast` (`z-[95]`) |
| BUG-085 | Events | Highlights / planning tips not in message catalogs | `events.page.*` keys in en/el/de/pl |
| BUG-086 | A11y | AI action chips `min-h-[32px]` | Bumped to `min-h-[44px]` in `ActionButtons.tsx` |

### Backlog / manual

| Area | Note |
|------|------|
| Home | Chip density / P2 items in `docs/archive/HOME_PAGE_UX_ASSESSMENT.md` — not in this pass |
| Tablet 640–767px | Manual matrix in `docs/archive/UX_UI_RESPONSIVE_MATRIX.md` |
| DE/PL | New footer strings synced from EN; native polish optional |

---

## Visual QA — Follow-up (May 16, 2026)

*Home + tablet alignment after full pass BUG-081–086.*

### Automated baseline

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm run test` | Pass |
| `npm run i18n:validate` | Pass |
| `npm run build` | Pass |

### Findings fixed (BUG-087–092)

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| BUG-087 | Home | Editor's picks subtitle didn't merge “Curious…” line | `home.discoverCurated` copy updated |
| BUG-088 | Home | `HomePlanningSection` / `HomePlaceOfDay` hardcoded EN | i18n keys + `useTranslations` |
| BUG-089 | Home | Recently viewed strip hardcoded EN | `home.recentlyViewed.*` |
| BUG-090 | Home | Place of Day actions tight on mobile | `gap-2 sm:gap-3`; See details `min-h-[44px]` |
| BUG-091 | Tablet | Category chips wrapped at `sm` while BottomNav until `md` | Chip scroll/wrap + fade use `md` breakpoint |
| BUG-092 | A11y | AI `FollowUpChips` 32px touch targets | `min-h-[44px]` |

---

## CTO follow-up hardening — May 17, 2026

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| BUG-093 | CI | UX specs not in core-funnel gate | `test:e2e:ux:ci` + `test:e2e:gate:ci` in Core Funnel Gate job |
| BUG-094 | Docs | `UX_PATTERNS.md` hub list incomplete | Full hub/detail list + E2E + analytics |
| BUG-095 | Analytics | Hub footer Plan/Ask AI untracked | `hub_footer_click` on `HubFooter` + detail Ask AI |
| BUG-096 | i18n | DE/PL/EL EN placeholders for QA strings | `scripts/i18n/patch-cto-locale-polish.mjs` |
| BUG-097 | E2E | Events hub footer untested | `hub-footer.spec.ts` events case |

---

## CTO hardening pass — May 17, 2026 (full fix)

*Act-as-CTO: automated gates + P1 code fixes + CI hardening.*

### Automated baseline

| Check | Result |
|-------|--------|
| `npm run lint -- --max-warnings 0` | Pass |
| `npm run typecheck` | Pass |
| `npm run test` | Pass (473) |
| `npm run i18n:validate` | Pass (1419 keys × 4 locales) |
| `npm run i18n:scan -- --fail` | Pass (0 hardcoded strings) |

### Findings fixed (BUG-098–106)

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| BUG-098 | Lint | Unused `LAYER` import in `TrailsClient.tsx` | Removed |
| BUG-099 | i18n routing | AI `ActionButtons` / `PlaceCards` prepended `/${locale}` — broke Strategy A for English | Use `@/i18n/navigation` paths only (no manual locale prefix) |
| BUG-100 | Security | Chat SSE deltas not server-sanitized | `sanitizeText()` on each streaming delta |
| BUG-101 | i18n | Home footer blocks hardcoded EN (`HomeInsiderTip`, `HomeTemplateLinks`, `WhyCyprus*`, `EditorsPicks`) | Server `getTranslations` + keys in en/el/de/pl |
| BUG-102 | i18n | `RightNowNearYou` default title hardcoded | `tHome("rightNowNearYou")` |
| BUG-103 | i18n | 18 hardcoded booking/airport/discover/cookie strings | `book.form.*`, `discover.detail.*`, `airport.page.quickActions`, `common.cookies` |
| BUG-104 | Visual | Discover booking heading `className="${TYPE.kicker}..."` (broken template) | Fixed to template literal + i18n trust block |
| BUG-105 | CI | Lint warnings + hardcoded scan not enforced | `--max-warnings 0`; `i18n:scan --fail` in quality job |
| BUG-106 | Home RSC | Weather/search/trails/this-week/share server-client split | `home-*-data.ts` + `*View.tsx` wrappers (prior session, verified build) |

### Deploy note (unchanged)

| ID | Area | Issue | Action |
|----|------|-------|--------|
| BUG-071 | Ops | Redis rate limits optional in prod | Set `UPSTASH_REDIS_REST_*` on Vercel before launch |

---

## Expert review remediation — May 17, 2026

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| BUG-107 | Visual | Home status strips / PostHeroBand inconsistent with trails/plan | `StatusStrip`, `PostHeroBand`, `STRIP` tokens; trip mode band on home |
| BUG-108 | i18n | `PlanShareBar` hardcoded EN | `plan.share.*` keys |
| BUG-109 | i18n | `RecentlyViewed` type labels hardcoded | `common.placeTypes.*` |
| BUG-110 | i18n | Home editor picks / featured wineries / insider tip from EN data | `home-editors-picks-data`, `home-featured-wineries-data`, `home-insider-tip-data` |
| BUG-111 | UX | Airport page missing `HubFooter` | `AirportFooter.tsx` + hub-footer e2e |
| BUG-112 | CI | `home-smoke.spec.ts` not in UX gate | Added to `test:e2e:ux:ci` |
| BUG-113 | i18n | Right Now API teases from EN descriptions | API returns `tease: null`; client uses `home.rightNow.card.defaultTease` |
| BUG-114 | Security | CSP `unsafe-eval` in production | Removed in prod via `proxy.ts` (`NODE_ENV`) |
| BUG-115 | Docs | Stale agent docs | `AGENTS.md` at app root |
| BUG-116 | Security | Bookings email lookup enumeration | Rate limited (`bookings-lookup`, 15/min); generic errors — document in deploy checklist |

### Follow-up — May 17, 2026

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| BUG-117 | i18n | `el` home `editorsPicks.items.*` desc/imageAlt still EN after sync | Native Greek copy for all four picks |

### Deep review bug fixes — May 30, 2026

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| BUG-122 | UX / GF4 | SearchBar dropdown navigated without `from=search&q=` — SmartBackLink could not restore query | `searchResultHref()` in `search.ts`; SearchBar + SearchResultCard |
| BUG-123 | i18n | Trail report form BackLink hardcoded EN | `tCommon("backTo", { label: trail.name })` |
| BUG-124 | Security | Chat action paths only prefix-checked, not place-validated | `resolveInternalPath()` in `sanitizeChatMetadata` |

### Holistic UX + image audit — May 31, 2026

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| BUG-125 | Images | 74 wineries shared one generic `cyprus-winery-troodos.jpg`; book flow used `winery.image` not `getAttractionImage` | `resolveWineryImage()` + wine-route regional fallbacks; book list/detail use `getAttractionImage`; 3 CC images added (see attributions below) |
| BUG-126 | Images | Choirokoitia used Kourion generic ancient photo | `cyprus-choirokoitia.jpg` (Wikimedia CC BY 3.0) |
| BUG-127 | UX | Search hub missing mobile `StickyPlanBar` | Sentinel + `StickyPlanBarBlock` on `/search` |
| BUG-128 | i18n | Trail “Pair well with” add-to-plan CTAs defaulted to English | Pass `addToPlanLabel` / `addToPlanAria` on trail detail |
| BUG-129 | UX | Book tasting back link always returned to discover detail | `BookWineryBackLink` + `SmartBackLink` `from=plan\|book\|wineries\|home\|bookings`; entry links pass `?from=` |
| BUG-130 | UX | Airport + wine-route hubs missing mobile `StickyPlanBar` | Sentinel + `StickyPlanBarBlock` on `/airport`, `/wine-routes/[slug]` |
| BUG-131 | i18n | Events month chips/headings hardcoded EN abbreviations | `events.page.monthShort.*` in all 7 locales |
| BUG-132 | i18n | Breadcrumb auto-labels for auth/book paths hardcoded EN | `common.breadcrumbs.*` keys wired in `Breadcrumbs.tsx` |

### Follow-up — May 31, 2026 (continued)

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| BUG-133 | i18n | Auth password show/hide aria + strength labels hardcoded EN | `auth.password.*` in all locales; `AuthPasswordInput` |
| BUG-134 | UX | `PlanStickyAddBar` competed with cookie/overlay chrome | `useBlockingOverlaysActive()`; reduced `pagePyPlan` mobile padding |
| BUG-135 | UX | Discover Right Now buried below full catalog | Moved above list/map tabs (after Place of the day) |
| BUG-136 | Images | Commandaria + verified wineries still on generic fallbacks | 2 CC Omodos winery assets; per-id map for verified wineries; Commandaria route image |

### CTO integration — August 19, 2026

Integrated green, current PRs #60 (brand refresh) and #59 (production hardening). Duplicate critical-bug investigation drafts were treated as superseded by #59. Remaining unique investigation patches applied on the integration branch:

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| BUG-137 | Bookings | UTC parsing and server-rendered date minima rejected valid same-day bookings in UTC-negative time zones | Parse calendar dates at local midnight; hydrate `min` after mount |
| BUG-138 | Maps / Security | Production CSP blocked OpenStreetMap detail embeds and Leaflet tiles | Allow OSM frame + tile origins while retaining `frame-ancestors 'none'` |
| BUG-139 | Plan | Same-tab itinerary adds could clobber each other via independent `useItinerary` instances | Merge in-memory days with storage before writes |
| BUG-140 | Offline | Concurrent `processQueue` callers could replay the same booking twice | Serialize queue processing; reject non-API queued URLs |
| BUG-141 | Chat | Malformed streamed/persisted metadata could crash the overlay | Sanitize metadata server-side and on persist/replay |
| BUG-142 | i18n | Localized `/book/winery` list 404'd | Locale proxy page + metadata |

### Follow-up — August 19, 2026 (rebase leftovers)

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| BUG-143 | Chat | Ask AI had no local `/skills` command; older PR hardcoded English and shrank tap targets | Localized `/skills` intercept + autocomplete; keep 44px targets and locale speech recognition (PR #68) |
| BUG-144 | Bookings | Email lookup on another device required a signed-in session | Additive HMAC lookup tokens + confirmation-email link; Bearer session still accepted (PR #69) |
| BUG-145 | CI | `checkout@v4` / `setup-node@v4` ran on deprecated Node 20 action runtime | Bump checkout, setup-node, and upload-artifact to `@v7` (PR #70) |
| BUG-146 | Analytics | Funnel events (`booking_start`, hub footer, plan add) required marketing-cookie consent | First-party `trackProduct` events send without “accept all”; privacy essential copy updated |
| BUG-147 | i18n | `fr`/`he`/`ro` nav, footer, cookies, and errors still mirrored English; switcher did not mark them as beta | Chrome translations for those locales + `localeBeta` suffix in the switcher; editorial/home body still English |
| BUG-148 | Discover / Trails | Accessible, family, and cycling filters were buried; trail cards hid live conditions and most place cards hid winter hours | Pin practical Discover chips; overlay hiker reports on trail cards; show hours / call-ahead on attraction cards |
| BUG-149 | Admin stats | No session-gated CSV/JSON of funnel + SME revenue for grant KPIs | `/api/stats?format=csv` uses admin cookie/Bearer (401 otherwise); locale mix from `properties.path` / `locale` |
| BUG-150 | Cycling | Cycling lived only as a Discover mood filter, not a hub with HubFooter | `/cycling` hub from activity-places data, locale proxy, footer/search links |
| BUG-151 | Wine routes | Route pages were editorial lists with no featured Book tasting CTA or structured hours | `bookableWineryIds` per route; hours/call-ahead strip + Book tasting to `/book/winery/[id]?from=wine-route` |
| BUG-152 | Plan | No DNSH-style strip; risk of inventing buses or fake carbon | Calm Plan strip: villages, Troodos trail conditions, airport buses from `airports` data only |
| BUG-153 | i18n | `he`/`fr`/`ro` home, Discover, Plan, Book, and privacy summary still English | Priority editorial in those locales; full privacy/terms body left English for legal review; beta labels kept |
| BUG-154 | Images | P0 winery heroes still generic or village-mismatched (Tsiakkas on mountain stock; Mystes on Gerolemo Omodos tasting; Krasochoria on summer Troodos) | CC village vineyards: Pelendri (`winery-tsiakkas.jpg`), Silikou Commandaria, January Lofou for Krasochoria; Mystes uses Laona fallback. Remaining verified partners still regional until tasting-room assets arrive. |
| BUG-155 | Ops / Security | Production `/api/health` hid `productionReady`; docs curled checks without `HEALTH_SECRET` | Public payload includes `productionReady` only; Bearer dump returns annex checks without hints or env values |
| BUG-156 | Images / Cycling | Cycling hub cards all used the same Troodos trail fallback | Regional existing assets: Troodos trail, Akamas coast, Limassol beach, Pitsilia mountain vineyard, Krasochoria January Lofou, Silikou valley |
| BUG-157 | Admin / KPIs | Stats export had locale and SME fees but not rural/mountain vs beach Plan mix (grant metric) | `plan_add.item_id` classified from curated data; CSV/JSON `plan_geography_*`; admin table |
| BUG-158 | Analytics | Funnel counted `trail_view` but the client never sent it | First-party `trail_view` on trail detail; report form and trails index excluded. No invented snow-skip counter |
| BUG-159 | Analytics / G3 | Accessible / family / cycling filter use was marketing-consent gated, so grant KPIs undercounted | First-party `discover_view` + `discover_filter`; CSV `discover_filter,*`; Annex II shots for accessible and family |
| BUG-160 | Grant / Annex II | Accessible and family Discover wireframes waited on chip copy, so shots showed pairings + filters with no place photos | Capture waits on card titles (`Pafos Archaeological Site`, `Nissi Beach`) and scrolls `section#id h3`; recapture those PNGs + default Discover |
| BUG-161 | Data / Discover | Accessible and family categories were thin; coasts/ancient/monasteries lacked sourced hours and access notes | DMT 2025 + Department of Antiquities fields; Kition + Larnaca Salt Lake Discover records; local winter pick is `larnaca-aliki` (not the trail id) |

**Image attributions (BUG-125, BUG-126, BUG-136, BUG-154):**

| File | Source | License |
|------|--------|---------|
| `cyprus-choirokoitia.jpg` | [Choirokoitia, Cyprus - panoramio](https://commons.wikimedia.org/wiki/File:Choirokoitia,_Cyprus_-_panoramio.jpg) | CC BY 3.0 |
| `cyprus-vineyard-laona.jpg` | [Zenon Winery Vineyards 3](https://commons.wikimedia.org/wiki/File:Zenon_Winery_Vineyards_3.jpg) | CC BY 4.0 |
| `cyprus-vineyard-mountain.jpg` | [Zenon Winery Vineyards](https://commons.wikimedia.org/wiki/File:Zenon_Winery_Vineyards.jpg) | CC BY 4.0 |
| `cyprus-winery-omodos-tasting.jpg` | [Wine tasting at Ktima Gerolemo, Omodos](https://commons.wikimedia.org/wiki/File:Wine_tasting_at_Ktima_Gerolemo_Winery,_Omodos,_Cyprus-_DSC00505.jpg) | CC BY-SA 4.0 |
| `cyprus-winery-barrels.jpg` | [Wine barrels at Ktima Gerolemo](https://commons.wikimedia.org/wiki/File:Wine_barrels_at_the_Ktima_Gerolemo_Winery,_Cyprus-DSC00511.jpg) | CC BY-SA 4.0 |
| `winery-tsiakkas.jpg` | [Vignoble de Palendria suivant les courbes de niveau](https://commons.wikimedia.org/wiki/File:Vignoble_de_Palendria_suivant_les_courbes_de_niveau.jpg) (Pelendri; GOC53) | CC BY 2.0 |
| `cyprus-vineyard-silikou.jpg` | [Vignoble sur le terroir de Silikou](https://commons.wikimedia.org/wiki/File:Vignoble_sur_le_terroir_de_Silikou.jpg) (GOC53) | CC BY 2.0 |
| `cyprus-vineyard-lofou-january.jpg` | [Vignoble en janvier à Lofou](https://commons.wikimedia.org/wiki/File:Vignoble_en_janvier_%C3%A0_Lofou.jpg) (Leonid Mamchenkov) | CC BY 2.0 |

**Manual follow-up (remaining):**

- Per-winery tasting-room / cellar photos for remaining verified partners (`vouni-panayia`, `kolios`, and still-regional `zambartas` / `santo`) and ~50 listings on wine-route fallbacks — partner press kits only; Commons has almost no named venue interiors.

---

## Visual QA — Full responsive pass (May 27, 2026)

*Branch: `fix/discover-trails-booking-maps` (PR #38). Viewports 320/375/768/1280+; automated gates + code audit.*

### Automated baseline

| Check | Result |
|-------|--------|
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm run test` | Pass (549) |
| `npm run i18n:validate` | Pass (1758 keys × 4 locales) |
| `npm run i18n:scan --fail` | Pass |
| `npm run data:validate` | Pass |
| `npm run build` | Pass |
| `npm run test:e2e:gate:ci` | Skipped locally — Playwright Chromium not installed in sandbox (`browserType.launch: Executable doesn't exist`; run `npm run test:e2e:install` first) |

### Findings fixed (BUG-117–121)

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| BUG-117 | Visual | Wine route hero images referenced missing files (`cyprus-wine-village.jpg`, `cyprus-paphos-hills.jpg`, `cyprus-akamas-coast.jpg`, `cyprus-commandaria-village.jpg`) | Mapped to existing `/images/cyprus/*` assets in `wine-routes.ts` + OG fallback in `wine-routes/[slug]/page.tsx` |
| BUG-118 | Layout | `PlanFooter` duplicated mobile bottom clearance (`footerBottomClearance` + `<main>` `mainPaddingBottom`) — excessive gap above site footer on plan page | Removed `footerBottomClearance` from `PlanFooter.tsx` (same pattern as BUG-081 / `HubFooter`) |
| BUG-119 | Layout | Trail detail used ad-hoc `pb-20`; discover detail used inline `pb-24 sm:pb-12` for sticky action bars | Added `LAYOUT.detailMobileStickyClearance`; applied on discover + trail detail pages |
| BUG-120 | i18n | Booking form Zod validation surfaced English defaults (`Required`, `Invalid email`) | `localizeBookingFieldErrors` + `validationLabels` in `useBookingForm`; winery/guide forms wired to `book.*Form.validation.*` |
| BUG-121 | i18n | Missing `partySizeRequired` validation key in message catalogs | Added en/el/de/pl under `book.guideForm.validation` and `book.wineryForm.validation` |

### Manual / no change required

| Area | Note |
|------|------|
| Maps | `MapInteractionGuard` + tap-to-enable overlay present on Discover, trails, plan, wine-route maps — scroll trap mitigated on touch |
| Hub pages | List/hub pages use `LAYOUT.pagePy` / `pagePyHeroFirst` / `safeAreaX`; home uses root layout without `(padded)` top offset |
| Images | All `cyprus-images.ts` paths resolve to files under `public/images/cyprus/` after wine-route fix |

---

## Bug check — 20 Aug 2026

Full inventory of `docs/QA_BUGS.md` (BUG-001–161) plus live health, deep-review leftovers, and a code audit. GitHub Issues API is not accessible from this environment (`Resource not accessible by integration`); this log remains the tracker.

**QA_BUGS historical entries:** all BUG-001–161 are **Fixed**. None were reopened.

### Fixed this pass

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| BUG-162 | A11y (DR-015 leftover) | Root `src/app/error.tsx` wrapped content in `<main>` inside layout `<main id="main-content">` | Use `<div role="alert">` + shared `EmergencyLine`, matching padded error / not-found |
| BUG-163 | Security | Chat 503 when no AI key listed env var names (including production) | Generic “guide unavailable” message; no key names or `.env.local` |
| BUG-164 | API (DR-033 leftover) | Cron 401 returned plain text `"Unauthorized"` | `jsonError("UNAUTHORIZED", …, 401)` on daily + weather-digest |
| BUG-165 | Security / SEO | Locale `/[locale]/events` JSON-LD used raw `JSON.stringify` (padded events already escaped) | `toSafeJsonForScript` |
| BUG-166 | Plan / SEO | Shared `/plan?plan=` links used generic “Plan Cyprus Winter” OG/title | `buildPlanPageMetadata` names places from the encoded itinerary; share bar shows the recipient preview line; shared URLs `noindex` |
| BUG-167 | Plan / G5 | Airport 48h CTA filled Plan with no “what now” framing | `PlanStartHere` after `?template=short-stay`; short-stay stays 5 stops / 2 days |
| BUG-168 | Events / G6 | Events hero had no freshness cue; empty filters buried Plan | “Updated monthly” under hero note; Plan is primary recovery CTA |
| BUG-169 | i18n | Beta `fr`/`he`/`ro` funnel chrome leftovers (`common.backTo`, breadcrumbs `bookTasting`, `verifiedPartner`, Discover Book CTA) | Translated those keys + companion booking/report chrome; privacy/terms **body** still English for legal review |
| BUG-170 | API (DR-007/008) | No `jsonSuccess()` helper; `push/subscribe` had no route tests | `jsonSuccess` → `{ ok: true, … }`; subscribe route uses it; Vitest covers 503/400/413/200 |
| BUG-171 | Discover | Hidden gems ≈ most of Discover (`localSecret` + family union) | Hidden section uses `bestFor` “hidden gem” / “off-the-beaten-path” only; Family stays its own filter |
| BUG-172 | Bookings (DR-019) | Sync merge kept local `pending` over API `confirmed`/`cancelled` | `mergeBookings` API-wins on id collision; local-only rows still kept |
| BUG-173 | A11y (DR-016) | SearchBar `role="option"` nested an Add-to-plan link and took focus via tabIndex | Options are non-focusable; Enter/click open detail; Add stays on SearchResultCard |
| BUG-174 | API (DR-008 leftover) | Success bodies still ad hoc on vapid/track/cron | Those routes use `jsonSuccess` (`{ ok: true, … }`); cookie session routes unchanged |

### Still open — ops / human (do not invent)

| Item | Severity | Notes |
|------|----------|-------|
| Live `productionReady: false` on `cyprus-winter.vercel.app/api/health` (HTTP 503) | P0 | Set `UPSTASH_REDIS_REST_*` + `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` on Vercel. Recapture health after. |
| `cypruswinter.com` DNS unresolved (last capture) | P0 | Registrar / DNS |
| IRIS PRE-SEED/0526 submit by 11 Sep 2026 13:00 | P0 | CVs, legal entity, 15% co-finance; pack not submitted |
| Tasting-room photos for remaining verified partners | P1 | Partner press kits only — `docs/WINERY_IMAGE_INTAKE.md` |
| `he`/`fr`/`ro` privacy/terms **body** still English | P1 | Legal review; do not machine-translate |
| Launch checklist sign-off blank | P1 | Engineering / Ops / Product / Content |
| G2 partner overlay is in-memory `Map` | P1 | Durable store + magic-link post-award |

### Still open — product / debt (not inventing features)

| Item | Severity | Notes |
|------|----------|-------|
| Expand Hidden gems editorial tags where copy implies quiet places but `bestFor` lacks the tag | P3 | Mechanism fixed (BUG-171); further curation is editorial |
| Remaining ad hoc success bodies (weather/right-now/bookings payloads; cookie-setting session routes) | P3 | jsonSuccess adopted on vapid/track/cron (BUG-174); reshape carefully |

**Do not change:** guest booking GET still requires Bearer session **or** HMAC `?token=` when Supabase is configured.
