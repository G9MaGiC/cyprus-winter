# Cyprus Winter — Deep Review (2026-05-20)

**Scope:** Balanced full-stack review using project agent teams (TEAM_QA, TEAM_REVIEW, TEAM_VISUAL_QA, TEAM_SEO, audit-explore, senior-software-engineer, ux-polish, branding-redesign, content-polish, code-reviewer, explore). **Report only — no code changes.**

**Ground truth:** `.cursor/PRODUCT_DEEP.md`, `PRD.md`, `docs/QA_PLAN.md`, `docs/QA_BUGS.md`, `docs/GOLDEN_FLOWS_AUDIT.md`

---

## Executive summary

1. **Automated quality is strong but not fully green:** lint, typecheck, 484 unit tests, build, and i18n hardcoded scan pass; **i18n coverage fails** (9 reported missing keys); **E2E gate fails** (2 tests — missing `airport-footer-plan48-cta`).
2. **Core funnel (Discover → Plan → Book) is implemented** with locale-safe routing, HubFooter/DetailActionFooter patterns, and broad E2E coverage — but **GF4 (search back + query restore) is broken** (`SmartBackLink` unused).
3. **Security baseline is solid** (Zod, sanitize, rate limits, exact email lookup) with **two launch-critical ops gaps:** admin secret in `sessionStorage` vs unused HttpOnly session API; **Upstash Redis required** for production rate limits.
4. **API contract drift:** documented `{ success, data?, error? }` is not used; successes are ad hoc. **7 of 13 API routes lack route tests.**
5. **Analytics undercounts conversion** when cookie consent is not `"all"` — `booking_complete`, `booking_start`, and hub footer clicks gated behind full consent while `plan_add` is not.
6. **Design system is mature** (tokens, no stray hex in components) but **loading skeletons drift** from live pages and **emergency line (112/1460/199) formatting is inconsistent** across footer, error, and airport pages.
7. **PRD Phase 2 features** (group hikes, weather-responsive itinerary, offline maps, gamification) are **strategic doc only** — not contradictions in Phase 1 MVP.
8. **SEO Strategy A is coherent** (canonical unprefixed sitemap, hreflang on locale layout) but **`/bookings` is in sitemap while `noindex`**; **`/privacy` and `/terms` are indexable but omitted** from sitemap.
9. **Prior QA_BUGS backlog is largely fixed** (BUG-001 through BUG-116); this pass surfaces **regressions and new gaps** (E2E contract, i18n coverage CI, GF4).
10. **Merge readiness:** **approve with nits** for continued development; address **High** items before treating admin, AI actions, and CI gate as production-hardened.

---

## Baseline gates (Wave 0)

| Check | Result | Notes |
|-------|--------|-------|
| `npm run lint -- --max-warnings 0` | **Pass** | |
| `npm run typecheck` | **Pass** | |
| `npm run test` | **Pass** | 64 files, **484** tests |
| `npm run i18n:validate` | **Pass** | 4 locales, 1502 keys (base: en) |
| `npm run i18n:coverage` | **Fail** | 9 keys reported missing from `messages/en.json` (see i18n section) |
| `npm run i18n:scan -- --fail` | **Pass** | No hardcoded JSX literals |
| `npm run build` | **Pass** | Next.js 16.1.6; ~1805 static pages |
| `npm run test:e2e:gate:ci` | **Fail** | **22/24** pass; 2 failures on `arrival-decision-flow` (desktop + mobile) |
| `npm run stress:api` | **N/A** | Dev server not running — 100% failures expected at `localhost:3000` |

### E2E failure detail

- **Spec:** `e2e/arrival-decision-flow.spec.ts:106` expects `data-testid="airport-footer-plan48-cta"` on `/airport`.
- **Cause:** `HubFooter` primary `AppLink` has no test id; hero uses `airport-hero-plan48-cta` only (`src/app/(padded)/airport/page.tsx:68-69`, `src/components/HubFooter.tsx:64-66`).
- **Fix direction:** Add `primaryTestId?: string` to `HubFooterProps` and set `airport-footer-plan48-cta` from `AirportFooter.tsx`.

### i18n coverage failure detail

Reported missing keys: `common.report.options.status.*`, `common.report.options.surface.*`, `home.addToPlan`, `home.bookTastings`.

- Trail status labels exist under **`trails.report.options.*`** (used correctly in `home-this-week-data.ts` with `tTrails` namespace) — likely **coverage script false positives** for namespace resolution.
- `home.placeOfDay.addToPlan` exists; code uses `useTranslations("home.placeOfDay")` — **false positive**.
- **CI impact:** `.github/workflows/ci.yml` runs `npm run i18n:coverage` without `--strict`; missing-key exit code **1 fails the Quality job**.

---

## Findings by severity

### Critical

| ID | Category | Issue | Evidence | Recommendation |
|----|----------|-------|----------|----------------|
| DR-001 | Security | **Unvalidated AI action paths** may navigate to arbitrary in-app routes | `src/components/ai/ActionButtons.tsx`; chat `---ACTIONS---` metadata in `src/app/api/chat/route.ts` | Validate paths via allowlist / `getPlaceById` before `router.push`; filter server-side |
| DR-002 | CI / E2E | **E2E gate red** — airport footer Plan 48h CTA test id missing | `e2e/arrival-decision-flow.spec.ts:106`; `HubFooter.tsx:64-66` | Add `primaryTestId` to HubFooter (quick win) |

### High

| ID | Category | Issue | Evidence | Recommendation |
|----|----------|-------|----------|----------------|
| DR-003 | Security / Admin | **Admin UI stores `ADMIN_SECRET` in `sessionStorage`**; HttpOnly `POST /api/admin/session` unused | `src/app/(padded)/admin/stats/page.tsx`; `src/app/api/admin/session/route.ts` | Migrate to cookie session flow per PRODUCT_DEEP §4 |
| DR-004 | Security / Ops | **In-memory rate limits** when Upstash unset — bypass across serverless instances | `src/lib/rate-limit.ts:34-55`; BUG-071 backlog | Set `UPSTASH_REDIS_REST_*` before launch |
| DR-005 | UX / GF4 | **Search → detail → back does not restore query** — `SmartBackLink` + `createDetailLink` never wired | `src/components/SmartBackLink.tsx` (no imports); `SearchResultCard.tsx:31` | Pass `from=search&q=` on search links; use SmartBackLink on detail |
| DR-006 | Analytics | **Conversion events gated on cookie `"all"`** — undercounts bookings and hub engagement | `src/lib/analytics.ts:48-52`; `HubFooter.tsx:63-69`; `WineryBookingForm.tsx` | Move critical funnel events to essential tier / `trackProduct` |
| DR-007 | API / Tests | **7 API routes without route tests** (admin/session, cron×2, weather, right-now, push×2) | `src/app/api/**/route.ts` vs `*.test.ts` | Add Vitest route tests per QA_PLAN §7 |
| DR-008 | API | **Documented `{ success, data?, error? }` contract unused** — ad hoc success bodies | `src/lib/api-response.ts`; bookings, right-now, weather, health | Document actual contract or add `jsonSuccess()` helper |
| DR-009 | CI | **`i18n:coverage` fails Quality job** | `scripts/i18n/coverage.ts` exit 1; `.github/workflows/ci.yml` | Fix coverage script namespace resolution or add missing keys |

### Medium

| ID | Category | Issue | Evidence | Recommendation |
|----|----------|-------|----------|----------------|
| DR-010 | Data | **Itinerary template IDs not validated** via `getPlaceById` in CI | `src/data/itinerary-templates.ts`; `useItinerary.ts:135-148` | Add test mirroring `combineWith` validation; filter on apply |
| DR-011 | Data | **Trail reports no-op without Supabase** — 200 “Thanks” but nothing stored | `src/lib/trail-reports.ts:38-53`; `api/trail-reports/route.ts` | Return `stored: false`; user-facing warning in prod |
| DR-012 | SEO | **`/bookings` in sitemap but `robots: noindex`** | `sitemap.ts:51`; `bookings/layout.tsx:9` | Remove from sitemap |
| DR-013 | UX / Email | **Resend failure not surfaced in UI** — booking saved, `emailStatus.confirmationSent: false` ignored | `api/bookings/route.ts:69-98`; `WineryBookingForm.tsx` | Show “saved; email may be delayed” |
| DR-014 | UX / Overlays | **Onboarding modal lacks focus trap and Escape** (cookie + AI have both) | `src/components/OnboardingModal.tsx` | Add trap + Escape; optional `inert` on main |
| DR-015 | A11y | **Nested `<main>` on not-found and error pages** | `layout.tsx:123`; `not-found.tsx:10`; `(padded)/error.tsx:23` | Single document landmark |
| DR-016 | A11y | **SearchBar listbox options not keyboard-focusable** | `src/components/SearchBar.tsx:131-157` | Roving tabindex or focusable options |
| DR-017 | Architecture | **Plan page fully client** (~300 lines) — JS on critical funnel | `src/app/(padded)/plan/page.tsx` | RSC shell + client leaf |
| DR-018 | Architecture | **Partial home RSC split** — Place of Day, Right Now, Start Here still client-only | `HomePlaceOfDay.tsx`, `RightNowNearYou.tsx` | Extract `*-data.ts` where SEO/i18n benefit |
| DR-019 | Storage | **localStorage bookings merge: local wins on ID collision** | `src/lib/bookings-storage.ts:13-22` | Document or API-wins for status |
| DR-020 | PRD | **Phase 2 features not shipped** (group hikes, weather itinerary engine, offline maps) | PRD.md §3.4–3.5, §7.2 | Document in ROADMAP as deferred |
| DR-021 | Capacitor | **Android loads remote URL** — offline/blank WebView risk | `capacitor.config.ts` | Bundled web dir or live-update strategy |
| DR-022 | Visual | **Loading skeletons mismatch live pages** (plan, trails, discover, airport, events) | `plan/loading.tsx` vs `plan/page.tsx`; etc. | Align `pagePyHeroFirst` / `pagePyPlan` / `bg-sand` |
| DR-023 | Visual | **`sand-50` Tailwind class not in theme** | `RegionPickerChips.tsx:48`; `ai/PlaceCards.tsx:36` | Use `sand-100`/`sand-200` tokens |
| DR-024 | Content / i18n | **PlacePickerModal hardcoded English** despite keys in messages | `PlacePickerModal.tsx:60,73`; `messages/en.json` `plan.browsePlaces` | Wire `useTranslations("plan")` |
| DR-025 | SEO | **`/privacy`, `/terms` indexable but not in sitemap** | `(padded)/privacy/page.tsx`; `sitemap.ts` | Add support entries |
| DR-026 | Analytics | **Admin funnel omits** `plan_view`, `hub_footer_click`, `plan_share` | `api/stats/route.ts:32-40` | Extend FUNNEL_ORDER or secondary breakdown |
| DR-027 | Security | **Booking email lookup unauthenticated** (by design) — enumerable at 15/min | `api/bookings/route.ts:169-206` | Accept + monitor; optional CAPTCHA |

### Low

| ID | Category | Issue | Evidence | Recommendation |
|----|----------|-------|----------|----------------|
| DR-028 | Nav | Hub pages (`/beaches`, `/villages`, `/wineries`) don't highlight Discover nav | `src/lib/nav.ts:19-25` | Map to parent or accept separate hubs |
| DR-029 | i18n | Trail report BackLink hardcoded EN | `TrailReportClient.tsx:146` | Use `tReport` keys |
| DR-030 | i18n | SearchResultCard type labels hardcoded EN | `SearchResultCard.tsx:9-13` | `useTranslations("common.placeTypes")` |
| DR-031 | i18n | DE `search.aria.actions` still English | `messages/de.json` | Native polish pass |
| DR-032 | API | Stats 401 uses `BAD_REQUEST` error code | `api/stats/route.ts:58-59` | Use `UNAUTHORIZED` |
| DR-033 | API | Cron 401 returns plain text, not `jsonError` | `cron/daily/route.ts:34-36` | Standardize error shape |
| DR-034 | Visual | Emergency line format differs footer vs error vs airport | `SiteFooter.tsx`; `not-found.tsx`; `airport/page.tsx` | Shared `EmergencyLine` component |
| DR-035 | Visual | `rounded-2xl` on cards where SKILL specifies `rounded-xl` | `EditorsPicks.tsx`, `HomePlaceOfDay.tsx`, etc. | Align to `CARD.base` |
| DR-036 | Docs | `docs/UX_UI_RESPONSIVE_MATRIX.md` archived — QA_PLAN §2.6 link stale | `docs/archive/` | Restore or update QA_PLAN link |
| DR-037 | Docs | QA_PLAN §7 test table stale (stats/track now tested) | `docs/QA_PLAN.md:236-237` | Update coverage table |
| DR-038 | Deprecated | `HomeHero.tsx`, `WINTER_TEMPLATES`, unused barrel exports | grep `@deprecated` | Remove dead code |
| DR-039 | Chat | Speech input `lang="en-US"` only | `AIChatInput.tsx:43` | Set from `useLocale()` |
| DR-040 | Push | Cron push URLs hardcoded `/plan`, `/weather` (no locale) | `cron/daily/route.ts:54` | Document EN-default policy |

---

## Findings by domain

### Architecture & APIs

- RSC boundaries on home are **largely sound** (`*-data.ts` + `*View.tsx` for weather, search, trail strip, this week, hero).
- **API response shape inconsistency** is the main architectural debt (DR-008).
- **Test gaps:** 54% API route coverage (6/13); hooks gap on `usePlanUrlActions`.
- **Multiple `useItinerary()` instances** on home (EditorsPicks) — duplicate storage listeners.

### Security

- Chat sanitize (input + SSE deltas), markdown link safety, trail-report Zod, track allowlist — **verified OK**.
- **Admin secret in browser storage** (DR-003) and **AI path validation** (DR-001) are top fixes.
- Booking lookup exact match **verified** (`.eq("guest_email", normalized)`).
- `STRESS_TEST_TOKEN` bypass **disabled in production** — verified.

### Funnel & UX

| Golden flow | Status |
|-------------|--------|
| GF1 Discover → Plan | Mostly OK; filter “places” EN leak |
| GF2 Multi-day plan | Code OK; PlacePicker i18n gap |
| GF3 Plan → Book → Bookings | Forms good; full submit E2E thin |
| GF4 Search back + query | **Broken** (DR-005) |
| GF5 Locale prefix | OK (AppLink, i18n router) |
| GF6 Empty/error | OK (plan failed add, not-found emergency) |

- Overlay stack (cookie → onboarding → AI) matches spec; onboarding focus weaker than cookie/AI.
- Hub vs detail footer contract **met** except airport primary test id.

### Accessibility

- Skip link, AI dialog trap, bookings form labels — **good**.
- **Nested main**, search combobox keyboard, onboarding trap — **gaps** (DR-015, DR-016, DR-014).
- Contrast: `text-olive/60–70` on sand may fail 4.5:1 — verify with axe.

### Design system

- **36 visual anomalies** (8 P0, 14 P1, 14 P2) from branding-redesign pass — top themes: skeleton drift, emergency line, chip/badge inconsistency, `sand-50`.
- No hardcoded product hex in TSX (except Google brand SVG).
- FilterChips → PILL pattern; map markers use TOKENS — **good**.

### Content & i18n

- Brand voice largely aligned (premium, no emoji, EUR, 112 in footer via `t.rich`).
- **i18n scan passes** for JSX literals; **object-literal English** in AI components bypasses scan.
- DE/PL functional but **native polish optional** for new footer strings.
- Prior `docs/I18N_AUDIT_2026-03-17.md` gaps largely addressed for heroes/home; topic pages (weather month copy) may still be partially EN in data.

### SEO

- Strategy A (unprefixed canonical + hreflang) — **consistent** on locale layout.
- Events JSON-LD guards invalid dates — **good** (`event-json-ld.ts`).
- Sitemap gaps: **bookings (should remove)**, **privacy/terms (should add)**.
- `/trails/[id]/report` intentionally noindex — correct omission.

### Tests & CI

- Unit: **484 tests**, strong data/helper coverage.
- E2E: 15 specs; gate covers core funnel + UX; **2 failures** block gate.
- **Quality job likely red** on i18n:coverage until DR-009 resolved.

---

## PRD alignment matrix

| PRD area | Implementation | Status |
|----------|----------------|--------|
| Winter-positioned home (weather, mood, plan CTA) | Home sections, trip mode, Right Now | **Aligned** |
| Discover / Trails / Events hubs | Routes + data in `src/data/` | **Aligned** |
| Plan templates + share | `itinerary-templates.ts`, `useItinerary` | **Aligned** |
| Winery + guide booking | `/book/*`, `api/bookings` | **Aligned** |
| Trail condition reports | UI + API; needs Supabase in prod | **Partial** |
| AI concierge | Multi-provider chat, rate limited | **Aligned** |
| Admin stats / funnel | `/admin/stats`, `api/stats` | **Aligned** (auth pattern needs fix) |
| Airport arrival flow | `/airport`, HubFooter | **Aligned** (E2E contract gap) |
| i18n (en, el, de, pl) | next-intl, 1502 keys | **Aligned** (coverage CI gap) |
| Group hikes / buddies | Not in codebase | **Phase 2 — deferred** |
| Weather-responsive itinerary | Static templates only | **Phase 2 — deferred** |
| Offline trail maps | Capacitor remote URL only | **Phase 2 — deferred** |
| Trail reporter gamification | Not implemented | **Phase 2 — deferred** |

---

## Quick wins (≤1 day each)

1. **Add `primaryTestId` to HubFooter** → fix E2E gate (DR-002).
2. **Remove `/bookings` from sitemap** (DR-012).
3. **Wire PlacePickerModal i18n keys** (DR-024).
4. **Replace `sand-50` with theme tokens** (DR-023).
5. **Add `/privacy`, `/terms` to sitemap** (DR-025).
6. **Update QA_PLAN §7 test coverage table** (DR-037).
7. **Fix i18n coverage script** or add alias keys for false positives (DR-009).

---

## Structural improvements (multi-sprint)

1. **Admin auth migration** to HttpOnly session cookie (DR-003).
2. **GF4 search provenance** — wire SmartBackLink end-to-end (DR-005).
3. **API contract standardization** + route tests for remaining 7 endpoints (DR-007, DR-008).
4. **Analytics consent model** for conversion events (DR-006).
5. **Shared EmergencyLine component** + loading skeleton alignment sweep (DR-022, DR-034).
6. **Plan page RSC split** (DR-017).
7. **Upstash Redis** production deploy (DR-004).
8. **AI action path validation** (DR-001).

---

## Regression check vs QA_BUGS.md

| Prior bug / area | This review |
|------------------|-------------|
| BUG-001 `/trip` broken link | **Still fixed** — no `/trip` hrefs |
| BUG-i18n plan/search locale drop | **Still fixed** — `@/i18n/navigation` |
| BUG-004 / BUG-071 Redis rate limits | **Still open (ops)** — DR-004 |
| BUG-033 home vs PRD | **Fixed** per May 2026 QA |
| BUG-080 arrival E2E flaky | **Regressed** — test id contract broken (DR-002) |
| BUG-111 airport HubFooter | **Implemented** — missing primary test id only |
| combineWith orphans | **Clean** — 484 tests pass |
| Health Supabase/Resend | **Fixed** — extended health check |
| Chat sanitize / SSE | **Fixed** — BUG-100 |
| Visual QA BUG-081–092 | **Mostly fixed**; new skeleton/emergency drift found |

**New issues to log:** DR-001 through DR-040 (prioritize DR-002, DR-003, DR-005, DR-009 for next sprint).

---

## Recommended next steps (fix order)

1. **Unblock CI:** HubFooter test id (DR-002) + i18n coverage (DR-009).
2. **Security hardening:** Admin session cookie (DR-003) + AI path validation (DR-001).
3. **Funnel correctness:** GF4 SmartBackLink (DR-005) + booking email status UI (DR-013).
4. **Ops:** Upstash Redis in production (DR-004).
5. **Quality debt:** API route tests (DR-007) + template ID validation (DR-010).
6. **Polish:** Loading skeleton alignment + emergency line component (DR-022, DR-034).
7. **Analytics:** Consent-tier review for conversion events (DR-006).

---

## Agent coverage

| Agent | Focus | Status |
|-------|-------|--------|
| shell | Automated baseline | Complete |
| audit-explore | PRD, security, funnel, QA_PLAN §3 | Complete |
| senior-software-engineer | RSC, APIs, hooks, tests | Complete |
| ux-polish | GF1–GF6, a11y, overlays | Complete |
| branding-redesign | TEAM_VISUAL_QA checklist | Complete |
| content-polish + seo-copywriter | Voice, metadata, sitemap | Partial (merged with orchestrator + explore) |
| code-reviewer + explore | Merge readiness, outliers | Complete |

---

*Generated 2026-05-20. No code changes in this pass.*
