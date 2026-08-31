# Cyprus Winter — Strict UX/UI Persona Audit — 2026-08-31

**Scope:** full product surface, all 7 canonical ICPs (`docs/ICPS.md`) + 16 QA critique lenses (`docs/QA_PERSONAS_FULL_STACK_2026.md`).
**Baseline:** `main` @ `ca827e6` (PR #225), production build.
**Method:** delta audit — every finding deduped against `docs/QA_BUGS.md` (…BUG-353), the RICE backlog (`docs/QA_PERSONA_PRIORITIES_2026.md`), and `docs/ICPS.md` §8; three hard buckets: **NEW** / **KNOWN-STILL-OPEN** / **PREVIOUSLY-FIXED** (re-verified, then dropped or reported as regression). Prior audit docs were treated as leads, never as evidence.
**Evidence key:** `[S]` static file:line · `[L]` live observation (route @ viewport/locale, production build) · `[G]` gate run this session.
**Rubric:** repo conventions only — severity Critical/High/Medium/Low per `.cursor/agents/audit-explore.md`; golden-path steps scored with the amazement rubric (Relief + Specificity + Payoff, 0–2 each; ≤3 ⇒ redesign candidate).

**Environment caveats:** e2e/screenshot evidence ran on Chromium build 1194 shimmed under the Playwright-1.62.1 registry name (the pinned Chrome-for-Testing 151 download is egress-blocked in the audit container). Two container artifacts were investigated and **excluded** as non-findings: `document.fonts.ready` wedging in headless (a `local()` fallback-font quirk) and slow first-hit `next/image` AVIF encodes.

---

## 0. Verdict

**The product is genuinely strong — and the 4.7/5 self-scorecard is too kind.** The design system, motion discipline, skeleton coverage, axe-clean WCAG 2.2 AA sweep, i18n structure (7 × 2312 keys), and perf discipline are real and verified. But walking the product as its own personas surfaces **2 Critical and 8 High defects the gates cannot see**: the core `/plan` page renders itinerary names one letter per line at 375px; booking forms promise a "verified partner request route… confirms within 24 hours" while **zero** partners have a deliverable email; a golden flow (GF6) marked ✅ in `docs/GOLDEN_FLOWS_AUDIT.md` has silently regressed; and the assistive-tech experience of the core loop (add → plan → share) is silent and focus-lossy in ways axe structurally cannot detect. Re-scored overall: **≈4.0/5** (§1).

**Verified good — deliberately NOT re-flagged:**
- `[G]` `npm run test:a11y` → **passed** (axe WCAG 2.2 AA, 31 routes incl. `/he`, `/he/plan`, contrast fatal).
- `[G]` `npm run test:e2e:visual-gate:ci` → **17/17 passed** (375/768/RTL overflow + content).
- `[G]` `npm run build` → clean.
- `[S]` BUG-351 alpha-text migration fully held (zero `text-olive/50–80`-class regressions); zero raw-Tailwind-palette or arbitrary-hex leaks in `src/**/*.tsx`; zero FOMO/urgency copy (zero `!` in EN values); zero emoji in UI copy; 44px touch targets held at every sampled control; sticky bars unmount when hidden; `OnboardingModal`'s `aria-hidden={!visible}` is **benign** (paired with `inert` — seed hypothesis rejected); motion contract held (no bounce/confetti/parallax; reduced-motion respected); PR #199's RTL logical-properties sweep held (Appendix B: only 3 genuinely direction-breaking classes remain in all of `src/`).
- PREVIOUSLY-FIXED, re-verified live/static and dropped: post-submit booking clarity (P0-01), click-to-call, winery price hints, plan realism warnings (when they fire — see AUD-04), booking merge direction (BUG-172), partner badge gating (BUG-348), winter-hours hedge + audit test (B2B-02), photography-trust CI gate, G1/G5/G6 amazement carry-forwards (G6 partially — see AUD-03).

---

## 0.1 Remediation status (fix pass, same day / same branch)

A fix pass followed the audit on this branch. **Fixed and re-verified against the full gate suite:** AUD-01 (trust copy gated on `isPartnerVerified`, fabricated guide phones suppressed incl. JSON-LD, "verified partner" wording → "licensed guides" across surfaces, SLA unified to 24–48h weekdays ×7 locales), AUD-02 (ItineraryCard actions wrap under the title on mobile), AUD-03 (add-failure via React state), AUD-04 (family Day 1 → Konnos Bay + coast↔coast realism warning), AUD-05 (Escape handler guarded; desktop More restores focus), AUD-06 (banner portals to an early-body anchor, announces on appear, blocked Ask-AI presses focus the banner), AUD-07 (add/remove announced via SRStatus, focus handed to "View plan", slug-leaking aria-labels removed), AUD-08 (auto status re-check on mount + retitled sync toggle), AUD-09 (cancel/change guidance + "Modify" → "Request a change"), AUD-12 (list headings de-scoped from "today" to winter-status framing), AUD-13 (cross-language search aliases de/pl/el/he/ro/fr), AUD-15 (`max-w-full` on the detail map), AUD-16, AUD-17, AUD-20 (dead Toast/Skeleton/LoadingOverlay deleted; `UX_PATTERNS.md` corrected), AUD-22, AUD-24 (server errors localized by code ×7), AUD-28 (partial: `color-scheme: light` declared + decision recorded), AUD-40…45, AUD-47, AUD-50…55, and the EventCard chip-shape drift from AUD-57.

**Correction to the register:** AUD-20 originally claimed `LAYER.toast` was orphaned — it is consumed by `InstallPromptBanner`; the token stays (its doc comment now names the consumer). The dead-component half of the finding stands and is fixed.

**Deliberately not fixed here (need product/editorial/supply decisions or are projects):** AUD-10 (native data-layer content — the §6.2 top project), AUD-11, AUD-14 (workation restructure), AUD-18 (locale switcher entry point), AUD-19 (tier-1 headline decision), AUD-21, AUD-23, AUD-25 (per-locale advisory URLs need verified sources), AUD-26, AUD-27 (menu-semantics rework beyond the Escape fixes), AUD-46, AUD-48, AUD-49, AUD-56, AUD-58, AUD-59, and the §5 known-open ledger.

---

## 1. Executive scorecard — vs `docs/SCORECARD.md` (2026-08-24, self-rated 4.7/5)

| Dimension | Self | Audit | Why (finding IDs) |
|---|---|---|---|
| Product clarity | 4.5 | **4.0** | Template content contradicts persona promises: family "gentle pace" day spans the island (AUD-04); workation template ignores its own "remote weekdays" (AUD-14). Persona kernel gap (3 of 7 ICPs in `.cursor/PRODUCT_DEEP.md`) — **fixed in this branch**. |
| Design system | 5 | **4.5** | Discipline is real (see §0), but `docs/UX_PATTERNS.md` documents a toast layer that has never mounted (AUD-20: `Toast.tsx`/`Skeleton.tsx`/`LoadingOverlay.tsx` zero importers, `LAYER.toast` orphaned) plus edge drift (AUD-33…38). No Critical. |
| Core funnel | 5 | **3.5** | E2E-green measures mechanics, not experience: `/plan` at 375px is visually broken at its payoff moment (AUD-02); GF6 silently regressed (AUD-03); the Book step's central trust claim is false for 100% of partners (AUD-01); post-book is a dead end (AUD-08, AUD-09). |
| Security | 4.5 | 4.5 | Out of audit scope; nothing contradicting it found. |
| Test & CI | 5 | **4.5** | Gates green but with measured blind spots: detail routes uncovered by the visual gate (AUD-15 was live on every discover detail), `GOLDEN_FLOWS_AUDIT.md` GF6 claim stale (AUD-03), no plural rules (AUD-42). |
| i18n / SEO | 5 | **4.0** | Structure is excellent (7×2312, parity-tested). Experience is not: curated decision-surface data renders **English in every locale** incl. full-tier de/el/pl (AUD-10); German search finds nothing for German terms (AUD-13); server errors surface EN in all locales (AUD-24); tier-1 home headline is a different copy generation than en/beta and sits outside the drift gate (AUD-19). |
| Data maintainability | 5 | 5 | Held (`data:validate` suite; ids verified in walks). |
| Mobile / Capacitor | 4.5 | **3.5** | AUD-02 (375px plan), AUD-15 (5px overflow on every discover detail at 375, LTR+RTL), AUD-41 (German bottom-nav truncation). |
| Merge hygiene | 5 | 5 | Held. |
| **Assistive-tech UX** *(new row — the scorecard has no a11y dimension)* | — | **3.5** | axe-green ≠ done: Escape steals focus app-wide on mobile (AUD-05); the consent banner is unreachable-by-announcement and silently disables Ask AI (AUD-06); the core add/remove loop is silent for SR users (AUD-07); `role="menu"` misuse ×3 (AUD-27). |
| **Trust honesty** *(new row)* | — | **3.0** | AUD-01 false "verified… 24h" claims; "Auto-saved" overstates durability (AUD-22); four different SLA numbers in one funnel (AUD-45); fabricated team page as the trust pillar (KNOWN-OPEN, §5). |
| **Overall** | **4.7** | **≈4.0** | Excellent bones; the gaps are concentrated exactly where personas feel them: mobile plan, booking trust, native-language depth, assistive tech. |

---

## 2. Persona × funnel matrix

Cells: ✅ solid · finding IDs = friction · **GAP** = nothing serves the cell. (Stages: Land → Orient → Discover → Plan → Book → Return; +i18n column for the persona's native locale.)

| ICP | Land | Orient | Discover | Plan | Book | Return | Native locale |
|---|---|---|---|---|---|---|---|
| **Claire** (Primary, UK) | ✅ 5/6 | ✅ | ✅ 5/6 (AUD-16) | AUD-02 | ✅ 6/6 form; AUD-01 | AUD-08, AUD-09 | ✅ en |
| **Nadia** (Growth, PL/IL) | ✅ | AUD-18 (switcher) | AUD-13 (search) | AUD-14 (workation) | AUD-23 (no price signal) | **GAP** (coworking/long-stay — known-open) | AUD-10; he: AUD-40 |
| **Anders** (Secondary, DE) | ✅ | ✅ | AUD-12 (conditions "today"); report loop 3/6 | AUD-02 | AUD-01 (guide surfaces + fabricated phone) | trail-report void (AUD-12) | AUD-13, AUD-41 |
| **Winter Sun Family** (Emerging) | ✅ | ✅ | ✅ 4–5/6 | **AUD-04 (2/6 — redesign)** | ✅ | — | AUD-10 (de) |
| **Local** (el) | ✅ | ✅ | `?filter=local` thin-but-honest 4/6 | ✅ | — | ✅ events 5/6 | AUD-19 (headline), AUD-10 |
| **Expat** | ✅ | AUD-18 | ✅ | ✅ | ✅ | ✅ | — |
| **Bleisure** | ✅ 6/6 `/airport` | ✅ | ✅ | ✅ 5/6 short-stay; AUD-02 | ✅ | — | — |

**Meta-finding (fixed in this branch):** the agent-facing kernel (`.cursor/PRODUCT_DEEP.md`, `.cursor/agents/audit-explore.md`) named only 3 of the 7 canonical ICPs — every automated audit/build pass has been structurally under-serving Family, Local, Expat, and Bleisure. Both files now carry all seven + the §6.1 native-experience standard added to `docs/ICPS.md`.

---

## 3. Per-ICP verdicts (amazement worksheets)

Scores are Relief + Specificity + Payoff (0–2 each), scored strictly at 375px on the production build.

### 3.1 Claire — Cultural Explorer (Primary) — verdict: **strong until the plan payoff and after the booking**
| Step | R | S | P | Σ | Note |
|---|---|---|---|---|---|
| Land `/` | 2 | 2 | 1 | 5 | "Sixteen degrees when home is six" + 3-lane triage answers the winter objection above the fold |
| `/discover` | 2 | 2 | 1 | 5 | Per-card winter-open truth is exactly her anxiety |
| Detail (Omodos/Lefkara) | 2 | 2 | 1 | 5 | Hours/parking/level-square honesty + kafenion secrets; dented by templated jargon (AUD-16) |
| Add to plan | 1 | 1 | 2 | 4 | Instant, no hijack; silent for SR (AUD-07) |
| `/plan` reflects it | 2 | 2 | **0** | 4 | Drive-time + daylight warnings are signature-grade — but her item names render one letter per line (AUD-02) |
| → `/book/winery` | 2 | 2 | 1 | 5 | Honest per-winery pricing and winter notes |
| Booking form (Tsiakkas) | 2 | 2 | 2 | **6** | The trust blueprint: request-not-reservation, no-payment promise, call/website fallback, "Fireside table?" prompt — undermined only by AUD-01's false "verified" line |
Top blockers: AUD-02, AUD-01, AUD-08/09 (post-book dead end).

### 3.2 Anders — Active Adventurer — verdict: **honest detail pages, over-claiming list surfaces, report loop has no read side**
| Step | R | S | P | Σ | Note |
|---|---|---|---|---|---|
| `/trails` | 1 | 2 | 1 | 4 | "Conditions today: 104 open" over a static May-2026 snapshot (AUD-12); "1 trails need caution" (AUD-42) |
| `/trails/artemis` | 2 | 2 | 1 | 5 | Microspikes/ice/signal honesty + "Seasonal guide snapshot—not a live report" label; no as-of date |
| Trail report | 1 | 1 | 1 | **3 ⇒ redesign** | Submitting works; no submitted report is visible anywhere — contributing feels like posting into a void |
| Add to plan | 1 | 1 | 2 | 4 | |
| Guide booking entry | 2 | 2 | 1 | 5 | Trail pre-select + languages; "Verified guide request route" + fabricated `+357 99 123456` phone (AUD-01) |

### 3.3 Nadia — Digital Nomad (Growth) — verdict: **weekend scaffolding is real; nomad promise is not yet**
| Step | R | S | P | Σ | Note |
|---|---|---|---|---|---|
| `/search?q=wine` | 1 | 1 | 1 | **3 ⇒ redesign** | Name+region-only cards, suggestion-dropdown race (AUD-43); her native query (`/de|pl` terms) returns nothing (AUD-13) |
| Workation template | 2 | 1 | 1 | 4 | Existing at all = relief; content contradicts "remote weekdays" (AUD-14) |
| `/weather` | 2 | 2 | 1 | 5 | Coast-vs-Troodos months with honest one-liners — ideal weekend scaffold |
Coworking/long-stay content remains the known-open gap (ICPS §8).

### 3.4 Winter Sun Family (Emerging) — verdict: **the template betrays the persona**
| Step | R | S | P | Σ | Note |
|---|---|---|---|---|---|
| `?filter=family` | 2 | 1 | 1 | 4 | Real filter + count; no age tags; loosely curated lane |
| Family detail (Fig Tree Bay) | 2 | 2 | 1 | 5 | Wheelchair/promenade/parking + drive time; no stroller/toilet specifics |
| `/plan?template=family` | 1 | 1 | **0** | **2 ⇒ REDESIGN** | "Gentle pace" Day 1 = Protaras + Paphos beaches, ~2h15 apart — and the realism engine's coast↔coast blind spot means no warning fires (AUD-04) |

### 3.5 Bleisure — verdict: **the product's best flow**
`/airport` scores **6/6** (per-airport taxi/bus/car prices, WiFi/SIM/cash micro-tips, "Tonight, just arrive. The island isn't going anywhere.") and hands off in 2 taps to a short-stay plan that keeps the 48-hour framing (5/6; AUD-02 still hits its items).

### 3.6 Local / Expat (brief)
`/events` 5/6 — month jump chips, "Updated monthly" freshness cue, unusually good specific copy (Christmas villages with hours and drive times; calm Bellapais crossing caveat); "now" isn't anchored to the current month. `?filter=local` 4/6 — honest but thin (6 places) and doesn't explain why Omodos/Lefkara qualify as "local" in winter. The deeper Local gap is language: the Greek experience still carries the previous-generation headline (AUD-19) and EN curated content (AUD-10).

Cross-flow: GF1 ✓, GF2 ✓, GF4 ✓ (en; de blocked by AUD-13), GF5 ✓ (locale never dropped in walks), GF6 ✗ (AUD-03).

---

## 4. New findings register

48 findings survived verification and dedupe (every Critical/High re-verified against source by the auditing orchestrator; dedupe grep terms recorded per finding in the lane worksheets). Full contract rows for Critical/High; Medium/Low compacted.

### 4.1 Critical

**AUD-01 — Booking trust copy claims a "Verified partner request route… confirms by email within 24 hours" while zero partners are reachable.**
`[S]` `src/components/bookings/BookingTrustStrip.tsx:15-21` renders unconditionally on every winery and guide form; copy at `messages/en.json` `book.form.trust.verifiedRoute`/`emailConfirm`; hub copy repeats it (`book.pages.wineryList.intro`). All 13 `partnerEmail` values in `src/data/wineries.ts` + `src/data/guides.ts` are RFC-2606 placeholders (`….example`) — `src/lib/partner-verification.ts` documents this itself ("can never receive a booking request") and correctly gates the API send (`src/app/api/bookings/route.ts:260,324`) and badges (BUG-348) — **but not this copy**. Guide surfaces add `PlanGuideBar.tsx:90` "Verified hiking partners" and fabricated visible phone numbers (`src/data/guides.ts:34`, e.g. "+357 99 123456").
`[L]` /book/winery/tsiakkas@375, /book/guide/cyprus-active-tours@375.
Personas: UK-01, IL-01, PL-01, B2B-01, Claire, Anders · Stage: Book · Dedupe: root = KNOWN-OPEN (BUG-346/BUG-348); the un-gated *copy* surfaces are NEW · Quick-win: **yes** — gate `verifiedRoute`/`emailConfirm`/`PlanGuideBar` claims on `isPartnerVerified()`, suppress placeholder-pattern phones, honest fallback ("We log your request — call or book direct below to guarantee it"). UK-01's 1-star review ("I still don't know if the winery actually confirmed") is literally accurate today.

**AUD-02 — `/plan` itinerary item names render one letter per line at 375px.**
`[S]` `src/components/ItineraryCard.tsx:86` — the actions cluster (`Navigate` + `Remove`/`Book`) is `shrink-0 flex-wrap justify-end` and squeezes the `flex-1` title column to ~8px. `[L]` /plan@375 seeded: "Lefkara" measured 24×216px (8 lines, one letter each); identical in RTL (`shots/plan--375-en.png`, `plan--375-he.png`). This is the funnel's payoff moment (GF1 step 5) on the primary viewport, for every persona, in every locale. The visual gate misses it because its /plan check runs with an empty plan.
Personas: all · Stage: Plan · Dedupe: NEW (grep "one letter", "vertical", "plan item", "squeez" — no hits) · Quick-win: **yes** — stack the actions row under the title below `sm:` (drop `shrink-0`, `w-full` actions row).

### 4.2 High

**AUD-03 — GF6 regressed: `/plan?add=<bad-id>` fails silently.** `[S]` `src/lib/plan-url-params.ts:11` patches the URL via raw `history.replaceState`, which never re-renders Next's `useSearchParams`; the failure gate at `src/app/(padded)/plan/PlanPageClient.tsx:196` therefore stays false until a manual reload. `[L]` verified: URL flips to `?add=failed`, no alert at +3s. `docs/GOLDEN_FLOWS_AUDIT.md` still claims GF6 ✅. NEW (regression vs that claim) · quick-win yes (set failure via React state in `usePlanUrlActions.ts:66-71`).

**AUD-04 — Family template Day 1 pairs Fig Tree Bay (east) with Coral Bay (Paphos), ~2h15 apart, on a "Gentle pace" day — and no warning fires.** `[S]` `src/data/itinerary-templates.ts:99`; `src/lib/plan-realism.ts:65-71` warns on 2-zone days only when one zone is Troodos — coast↔coast (the island's longest same-day drive) is a blind spot. `[L]` /plan?template=family@375: only the daylight hint renders. NEW (BUG-217/219 fixed this class for the mountain template only) · quick-win yes (fix the data day; add non-adjacent coast-pair warning).

**AUD-05 — A global Escape handler steals focus to the hamburger on every Escape press (viewports <lg).** `[S]` `src/components/Nav.tsx:37-46` unconditional `window` keydown → `closeMobileMenu()` at `Nav.tsx:21-24` always rAF-focuses the hamburger even when the menu was never open — overriding every modal's own focus restore (`AIAssistant.tsx:36-39`, `ClearDayModal.tsx:29`). Silent on desktop (button `display:none`) which masked it. NEW · quick-win yes (guard on `open`).

**AUD-06 — Cookie consent banner: last in DOM (~30–100 tab stops away), never announced to SR, and silently turns "Ask AI" into a no-op until answered.** `[S]` `src/app/layout.tsx:159` renders `ClientComponents` after `<main>`/footer; `CookieConsentBanner.tsx:63-66` (`aria-live` on a pre-populated insert announces nothing; `data-overlay-active="true"` unconditional → `AIAssistant.tsx:42-45` swallows every press). An SR user who never discovers the banner experiences AI as permanently broken. NEW · quick-win yes (render first in body; announce via `SRStatus`).

**AUD-07 — The core loop is silent and focus-lossy for assistive tech.** Adding: `src/components/AddToItineraryButton.tsx:42-77` — the focused button unmounts, replaced by a non-focusable span; no live region exists on detail surfaces; bonus: `aria-label` interpolates the raw slug (`aria.placeInItinerary` with `{id}` → "…: lefkara"). Removing: `src/components/plan/DayContentPanel.tsx:168` default `aria-relevant` misses removals; the remove button unmounts under focus (`ItineraryCard.tsx:98-105`). NEW · quick-win yes (shared SRStatus + focus handoff to the "View plan" link / day heading).

**AUD-08 — `/bookings` never re-fetches: "pending" stays stale forever on the booking device.** `[S]` `src/app/(padded)/bookings/page.tsx:57-65` reads localStorage only; the only refresh path is behind "Booked on another device? Load by email" — mis-framed for the majority case; partner confirm/cancel sends no guest email (`src/lib/email.ts` has no status sender). NEW · quick-win partial (auto-refetch on mount for known emails; retitle the toggle).

**AUD-09 — No cancel/change path anywhere; "Modify" opens a blank re-request that files a duplicate.** `[S]` `bookings/page.tsx:490` (`from=bookings` only styles the back link); guest-side cancel doesn't exist (`src/lib/bookings.ts:198-247` partner-only); zero cancellation-policy copy in the catalog. UK-01's explicit ask. NEW · quick-win yes for copy ("Reply to your confirmation email or call the winery — no charge"), rename Modify.

**AUD-10 — Curated data-layer content is English in *every* locale on decision surfaces — including full-tier de/el/pl.** `[S]` winery `bookingNote`/hours/`winterTip`/`goodFor` (`src/data/wineries.ts`), attraction descriptions/backstories (`src/data/attractions.ts:745,753`), secret-gem tips (`src/data/secret-gems.ts:62`). `[L]` /de/book/winery, /el/book/winery, /he/book/winery@375: ~60 visible EN strings each — operational Book-stage content (hours, "call ahead") is exactly what must be understood. Not covered by `docs/BETA_LOCALE_EN_HOLDOUTS.md` (messages-only). NEW for these surfaces (BUG-110 shipped the overlay pattern for Home only) · not a quick win — the §6.1 native-experience standard added to `docs/ICPS.md` names this the top i18n conversion item.

### 4.3 Medium (18)

| ID | Finding | Evidence | Personas | Quick win |
|---|---|---|---|---|
| AUD-11 | Search result cards carry no winter cue or price hint; search step scores 3/6 | `[L]` /search?q=wine@375; `src/components/SearchResultCard.tsx` | Nadia, Claire | n |
| AUD-12 | Trail conditions framed "today" over static May-2026 data; home says "4 open" (silently Troodos-only) vs /trails "104 open"; no as-of date; submitted reports have no read side | `[S]` `src/data/trails.ts:2437-2439`; `src/app/_home/home-trail-conditions-data.ts:7` | Anders, DE-01 | y (relabel + as-of chip; surface reports) |
| AUD-13 | German/Polish search terms return nothing (`/de/search?q=wein` → 0 results vs en q=wine → 12) | `[S]` `src/data/search-aliases.ts:5-22` place spellings only | Anders, Nadia, GR-01 | y (per-locale category aliases) |
| AUD-14 | Workation template contradicts its own "Remote weekdays… wifi cafés" promise — every day gets 2 tourist stops, e.g. a 3h hike + winery on a workday | `[S]` `src/data/itinerary-templates.ts:107-123` | Nadia | n |
| AUD-15 | 5px horizontal page overflow on **every** discover detail at 375px (LTR+RTL): map wrapper `aspect-video min-h-[200px]` → 355.5px preferred width in a 327px column; `max-w-full` verified live as the fix; detail routes are uncovered by the visual gate | `[S]` `src/components/DiscoverLocationMap.tsx:50` `[L]` /discover/lefkara + /he/… | all mobile | y |
| AUD-16 | Templated jargon bullet on every detail page: "{region} is a practical stop for the same day plan flow." | `[S]` `messages/en.json` `detail.whyNow.regionFlow`; `DetailHeroSection.tsx:109` | Claire | y |
| AUD-17 | SearchBar Escape blurs the input (APG: keep focus); populated listbox has no result-count announcement | `[S]` `src/components/SearchBar.tsx:72-77,142-168` | A11Y-01 | y |
| AUD-18 | Locale switcher is footer-only — measured ~23,400px of scroll on /he/trails@375; prefixed wrong-locale landers get zero UI affordance (Accept-Language 307 works on unprefixed first visit only) | `[S]` `src/components/LocaleLinks.tsx` sole mount `[L]` measured | IL-01, RO-01, Nadia | n |
| AUD-19 | Tier-1 home headline is a different copy generation: el/de/pl carry "Escape the cold…" while en/he/ro/fr carry "A quieter side of the island."; the editorial-drift gate guards beta locales only — intent unverifiable, needs an editorial decision either way | `[S]` `messages/{el,de,pl}.json` `home.headline` vs en/he/ro/fr | Local, DE, PL | y (decide + extend gate) |
| AUD-20 | The documented feedback layer is dead code: `ui/Toast.tsx` (+`useToast`), `ui/Skeleton.tsx`, `ui/LoadingOverlay.tsx` have zero importers; `docs/UX_PATTERNS.md` documents a system that never mounts (its warning variant would fail AA if it ever did). *Correction: `LAYER.toast` is NOT orphaned — `InstallPromptBanner` uses it; token kept.* | `[S]` verified zero importers | all | y (delete or mount) |
| AUD-21 | Offline queue keeps only half its promise: non-retryable failures are silently discarded; successful retries never appear in /bookings | `[S]` `src/lib/offline-queue.ts:106-114` | UK-01, PERF-01 | n |
| AUD-22 | "Auto-saved" / "Saves automatically." overstate durability — plan + bookings are this-browser-only; no save nudge at booking success; clearing site data destroys both unwarned | `[S]` `PlanShareBar.tsx:88`; `PlanPageClient.tsx:355` | UK-01, DE-01 | y ("on this device" + one success-screen sync line) |
| AUD-23 | No price signal on guide booking or plan (winery-only "from €" shipped); PL-01's budget lens unanswered | `[S]` `src/data/guides.ts:3-22` (no guest price field) | PL-01, RO-01 | y (guides) |
| AUD-24 | Booking form surfaces raw English server errors in all 7 locales (429, "Invalid input") though the localization pattern exists in-repo (TrailReportClient maps codes) | `[S]` `src/hooks/useBookingForm.ts:161-166`; `api/bookings/route.ts:169-183` | PL-01, GR-01, DE-01 | y |
| AUD-25 | Crisis posture is a static UK-centric strip: gov.uk advisory link hard-coded for all 7 locales; no alert-time behavior; strip absent from /book/* | `[S]` `src/components/travel/TravelTrustStrip.tsx:30` | CRISIS-01, IL-01 | y (per-locale link map) |
| AUD-26 | Partner-corrected winter hours live in an in-memory `Map` — silently revert on redeploy; no "last verified" shown to guests | `[S]` `src/lib/partner-overlay.ts:6` | B2B-01 | n |
| AUD-27 | `role="menu"` misuse ×3 (mobile menu has no menuitems; menus have no arrow keys; trap logic hand-rolled 3× vs `useTrapFocus`); desktop More Escape drops focus to body; skip-nav exists only on Home while /trails needs ~26–30 tab stops to the first card | `[S]` `Nav.tsx:226,160-166,39-42`; `BottomNav.tsx:180-188`; `HomeSkipNav.tsx` | A11Y-01 | y |
| AUD-28 | No dark scheme anywhere (0 `dark:` variants, no `prefers-color-scheme`, no `color-scheme` declaration) for an evening-heavy winter PWA — a product decision, but currently an undocumented one | `[S]` verified zero hits | NORD-01, Anders | n (record decision; declare `color-scheme: light`) |

### 4.4 Low (20)

| ID | Finding | Evidence |
|---|---|---|
| AUD-40 | AI chat bubble tails don't flip in RTL (`rounded-br/bl-md`) — the last 3 direction-breaking classes in `src/` (live-verified on /he) | `src/components/ai/AIChatMessages.tsx:30,31,125` → `rounded-ee/es-md` |
| AUD-41 | German BottomNav labels truncate at 375px: "Wanderwege" clipped 18px at the 56px cap | `src/components/BottomNav.tsx:127,150` |
| AUD-42 | No plural rules: "1 trails need caution" on home + /trails | `messages/en.json` `cautionOnly` (×7 locales) |
| AUD-43 | Search suggestions can auto-open over identical results on landing (autofocus/hydration race) | `src/components/SearchBar.tsx:65,125-128` |
| AUD-44 | Raw HTML entity rendered: "what you`&apos;`ve added" on /plan; and quick-add chip renders "Artemis Trail added Artemis Trail" | `messages/en.json` `worksWell`; `DayContentPanel.tsx:102` (both visible in `plan--375-en.png`) |
| AUD-45 | Four different SLA numbers in one booking journey ("within 24 hours" / "24–48 on weekdays" / "usually within a day" / "two business days") | `book.form.trust.*`, `book.wineryForm.success.*`, `book.pages.wineryList.intro` |
| AUD-46 | "Verified partner" explained only via desktop-only `title` tooltip — touch users never learn what it means | `book/winery/[id]/page.tsx:100-107` |
| AUD-47 | Off-season hours disclaimer hardcoded EN in `src/data` for all locales (routes around `i18n:scan`) | `src/data/wineries.ts:54-55` via `WineryBookingHints.tsx:31` |
| AUD-48 | Booking-flow jargon leaks: "queued as sync pending", "Booking states:", "when delivery is available" | `book.form.states.*` keys |
| AUD-49 | EN fallback on /he lacks bidi isolation — "Skip Pano. Start in Kato." renders period-first; applies to every AUD-10 string | zero `dir="auto"`/`<bdi>` in src |
| AUD-50 | "(beta)" locale suffix never explained in-product | `LocaleLinks.tsx:32,44`; `common.localeBeta` sole key |
| AUD-51 | PlanShareBar copy confirmations never reach SR (fixed `aria-label` pins the accessible name over "Link copied") | `PlanShareBar.tsx:104,122,142` |
| AUD-52 | BottomNav More: outside tap force-focuses the More trigger | `BottomNav.tsx:61,64-74` |
| AUD-53 | Hardcoded palette hex in `global-error.tsx` inline styles — correct today, unguarded by `brand-colors.test.ts` | `src/app/global-error.tsx:19-88` |
| AUD-54 | `⚠` glyph in `text-golden` on a light surface (rule: `golden-ink`); may render as color emoji on mobile fonts | `DetailHeroSection.tsx:121` |
| AUD-55 | "Pre-built itineraries" in user-facing copy (rule: "Plan") | `messages/en.json:616` + 6 mirrors |
| AUD-56 | Ad-hoc z-index off the LAYER scale (`z-[45]` restated, `z-20`, `z-[5]`×8 map overlays) | `ContextualHelp.tsx:144`, `NextOnPlanBar.tsx:61`, 5 map files |
| AUD-57 | Chip shape conflict (`rounded-lg` fighting `chipTertiary`'s `rounded-full`); skeleton/live width mismatch on /weather/[month]; TYPE.stat bypass in bookings/admin stats; token strings restated by hand in 6 files | `EventCard.tsx:95`; `weather/[month]/loading.tsx:8`; `bookings/page.tsx:292,301` |
| AUD-58 | Family lane: no age tags on cards; paddle activity + 4 wineries inside `?filter=family` feel loosely curated | `[L]` /discover?filter=family@375 |
| AUD-59 | `/events` "now" not anchored to the current month (a November visitor scrolls past February's carnival first) | `[L]` /events@375 |

---

## 5. Known-but-still-open ledger (not re-counted above)

| # | Item | Standing citation | Audit note |
|---|---|---|---|
| 1 | `.example` partner emails / partner reachability | BUG-346 open decision; BUG-348 gated badges/API | Root of AUD-01; gating held, copy didn't |
| 2 | Fabricated team roster on `/team` as the trust pillar | BUG-346 open decision | Still live; `PRODUCT_DEEP.md` names "team visibility" as a trust source — decide: real bios or an honest "How we choose places" page |
| 3 | Email localization / from-domain | BUG-346 open | |
| 4 | Cultural/archaeological tour booking (supply); group-hike matching; Nadia coworking/long-stay; "Cyprus Wrapped" | `docs/ICPS.md` §8 status 29 Aug | Confirmed still absent in walks |
| 5 | Partner tasting-room photos ops-gated (~55 venues); regional image fallbacks | SCORECARD note; QA_BUGS P1 backlog | |
| 6 | Beta locales awaiting lawyer sign-off | `docs/BETA_LOCALE_GRADUATION.md` | Only unchecked box |
| 7 | GitHub Actions startup_failure (ops) | BUG-347 | Not a UX item |

**Stale-doc corrections:** `docs/DEEP_REVIEW_2026-05-29.md` "fr/he/ro ~43% English" is superseded (all 7 locales at 2312 keys; holdouts intentional); `docs/GOLDEN_FLOWS_AUDIT.md` GF6 ✅ is stale (AUD-03).

---

## 6. Remediation backlog

### 6.1 Quick wins (≤1 day each; ordered by leverage)
1. **AUD-02** — stack ItineraryCard actions under the title `<sm:` (unbreaks the funnel payoff on mobile, all locales).
2. **AUD-01** — gate the three trust strings + PlanGuideBar claim on `isPartnerVerified()`; suppress placeholder phones; honest fallback line.
3. **AUD-03** — surface the add-failure via state, not URL readback; update `GOLDEN_FLOWS_AUDIT.md`.
4. **AUD-04** — fix family Day 1 data + add coast↔coast realism warning.
5. **AUD-05/06/07** — the a11y High trio: guard the Escape handler; move + announce the consent banner; SRStatus + focus handoff on add/remove.
6. **AUD-15** — `max-w-full` on `DiscoverLocationMap.tsx:50` (verified fix); add one detail route to the visual gate.
7. **AUD-12** — relabel "today" → "Winter guide status" + as-of chip; scope home strip to Troodos.
8. **AUD-13** — per-locale category aliases in `search-aliases.ts`.
9. **AUD-24** — map server error codes through `errors.api.*` in `useBookingForm`.
10. **AUD-42/44/45/55** — plural rule, apostrophe, added-chip text, one SLA number, "Pre-built plans" (×7 locales each).
11. **AUD-20** — delete the dead UI layer (or mount `ToastContainer`) + fix `UX_PATTERNS.md`.

### 6.2 Projects (RICE-lite: Reach × Impact × Confidence / Effort)
| Project | Findings | R | I | C | E | Score |
|---|---|---|---|---|---|---|
| Native decision-surface content (BUG-110 overlay for winery/attraction data) + drift-gate for tier-1 | AUD-10, AUD-19, AUD-47, AUD-49 | 8 | 8 | 0.9 | 3 | **19.2** |
| Post-book lifecycle: auto-refetch, status emails, cancel/change path | AUD-08, AUD-09, AUD-21 | 6 | 8 | 0.9 | 3 | 14.4 |
| Conditions trust loop: as-of surfaces + visible reports + report-void fix | AUD-12 + Anders 3/6 step | 5 | 7 | 0.8 | 2 | 14.0 |
| Locale reachability: switcher entry point in Nav/More + wrong-locale suggestion bar + beta explainer | AUD-18, AUD-50 | 6 | 6 | 0.8 | 2 | 14.4 |
| Nomad honesty: workation template restructure + coworking/long-stay content (known-open) | AUD-14, ICPS §8 | 4 | 7 | 0.7 | 3 | 6.5 |
| Menu semantics + hub skip-nav consolidation on `useTrapFocus` | AUD-27 | 4 | 5 | 0.9 | 2 | 9.0 |
| Dark-scheme decision (record it; `color-scheme: light`; optional dark set via existing tokens) | AUD-28 | 5 | 4 | 0.6 | 4 | 3.0 |

### 6.3 Proposed `docs/QA_BUGS.md` entries — **provisional numbering, assign at triage; not appended to the log to avoid bypassing triage**

Formatted per `docs/QA_PLAN.md` §5; SLA class per §6 (Critical = before launch, High = 1 sprint).

```markdown
### [BUG-354] Booking trust strip claims verified 24h email route while no partner email is deliverable
**Severity:** Critical  **Area:** Functional/Trust  **Page/Component:** /book/winery/[id], /book/guide/[id], PlanGuideBar, BookingTrustStrip
Reproduction: open any booking form → trust strip shows "Verified … request route." + "confirms by email within 24 hours"; all partnerEmail values are .example (partner-verification.ts); api never sends. Expected: claims gated on isPartnerVerified(); honest fallback. Fix status: Fixed on this branch (audit 2026-08-31, AUD-01)

### [BUG-355] /plan itinerary item names render one letter per line at 375px
**Severity:** Critical  **Area:** Visual/Mobile  **Page/Component:** /plan, ItineraryCard
Reproduction: add 2+ places, view /plan at 375px → title column ~8px, name renders vertically (en + he). Expected: readable name; actions wrap below. Fix status: Fixed on this branch (AUD-02)

### [BUG-356] GF6 regression: /plan?add=<invalid-id> shows no failure alert until reload
**Severity:** High  **Area:** Functional  **Page/Component:** /plan, usePlanUrlActions, plan-url-params
Fix status: Fixed on this branch (AUD-03)

### [BUG-357] Family template Day 1 spans Protaras↔Paphos with no realism warning (coast↔coast blind spot)
**Severity:** High  **Area:** Functional/Content  **Page/Component:** itinerary-templates.ts, plan-realism.ts
Fix status: Fixed on this branch (AUD-04)

### [BUG-358] Global Escape handler steals focus to hamburger on every Escape (<lg)
**Severity:** High  **Area:** A11y  **Page/Component:** Nav.tsx
Fix status: Fixed on this branch (AUD-05)

### [BUG-359] Cookie consent banner unreachable by announcement, last in DOM, silently disables Ask AI
**Severity:** High  **Area:** A11y  **Page/Component:** CookieConsentBanner, ClientComponents, AIAssistant
Fix status: Fixed on this branch (AUD-06)

### [BUG-360] Core plan add/remove silent + focus-dropping for assistive tech; aria-labels leak raw ids
**Severity:** High  **Area:** A11y  **Page/Component:** AddToItineraryButton, DayContentPanel, ItineraryCard
Fix status: Fixed on this branch (AUD-07)

### [BUG-361] /bookings never re-fetches on the booking device; pending status stale forever; no status emails
**Severity:** High  **Area:** Functional  **Page/Component:** /bookings, partner PATCH, email.ts
Fix status: Fixed on this branch (AUD-08)

### [BUG-362] No guest cancel/change path; "Modify" files a duplicate request
**Severity:** High  **Area:** Functional/Trust  **Page/Component:** /bookings
Fix status: Fixed on this branch (AUD-09)

### [BUG-363] Curated data-layer content (winery hours/notes, attraction backstories, gem tips) is EN in all locales
**Severity:** High  **Area:** i18n  **Page/Component:** src/data/*, /de|el|pl|he book + detail surfaces
Fix status: Open (AUD-10; fix path = BUG-110 overlay pattern; standard: docs/ICPS.md §6.1)
```

---

## 7. Persona-doc improvements shipped with this audit (same branch)

- `docs/ICPS.md`: **Market reality check** (arrivals mix vs ICP ranking; Anders re-weighted toward DE; he/pl elevated to conversion work) and **§6.1 Native-language experience standard** — per-market native hooks (catalog-sourced lines marked ✓, proposals marked ◇ pending native review), per-market "what native must mean", and the three gaps the standard exposes (AUD-10, AUD-19, AUD-18/50). §7 gains an i18n action item; doc stamped Aug 2026.
- `.cursor/PRODUCT_DEEP.md`: persona kernel table expanded 3 → 7 (Family, Local/Expat, Bleisure) + pointer to §6.1 — closes the kernel-vs-canon meta-finding.
- `.cursor/agents/audit-explore.md`: audit lens now names all seven ICPs and requires locale-aware flow checks.

---

## Appendix A — Evidence index

27 screenshots (scratchpad-only, not committed): {home, discover, discover-detail(lefkara), search(q=wine), trails, trail-detail(artemis), plan(seeded 3 items), book-winery-form(tsiakkas), events} × {375-en, 375-he(RTL), 768-en}; manifest records per-shot horizontal-overflow measurement (`discover-detail` = 5px in both directions — AUD-15) and `dir` attribute. Live walks: 10 Playwright scripts (GF1–GF6, per-persona), DOM-assertion based; no bookings submitted.

## Appendix B — RTL physical-class triage (methodology + result)

Grep: `(^|[[:space:]"'\x60])(ml|mr|pl|pr)-([0-9[]|px)|(^|[[:space:]"'\x60])(left|right)-([0-9[]|px)|text-left|text-right|rounded-(tl|tr|bl|br|l|r)-` over `src/**/*.tsx` (note: `\s` inside a POSIX bracket class is a literal — earlier sweeps disagreed, 3 vs 57/59, because of this). **28 hits: 3 BREAKING** (the AIChatMessages bubble corners, AUD-40), **25 safe** — symmetric `left-0 right-0` full-bleed bars/overlays, `left-1/2` centering, both-side-anchored captions, and physical safe-area padding (`pl/pr-[env(safe-area-inset-*)]`), which is *correct* as physical since notch geometry doesn't mirror with text direction. Zero `text-left/right`, zero bare directional spacing utilities — PR #199's sweep held.

## Appendix C — Gate runs (this session, 2026-08-31)

```
npm run build                     → exit 0 (compiled 23.4s)
npm run test:a11y                 → exit 0 — 1 passed (2.5m) [31 routes, contrast fatal]
npm run test:e2e:visual-gate:ci   → exit 0 — 17 passed (14.6s)
```
Browser: Chromium 1194 binaries shimmed under the 1234 registry name (pinned CfT 151 egress-blocked in the audit container). A first run failed 18/18 on browser resolution — environmental, excluded.

## Appendix D — Amazement worksheets

Embedded in §3 per persona. Redesign candidates (≤3): Anders trail-report loop (3), Nadia search step (3), **Family template day (2)**.
