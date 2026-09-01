# Cyprus Winter — Strict UX/UI Persona Audit — 2026-08-31

**Scope:** full product surface, all 7 canonical ICPs (`docs/ICPS.md`) + 16 QA critique lenses (`docs/QA_PERSONAS_FULL_STACK_2026.md`).
**Baseline:** `main` @ `ca827e6` (PR #225), production build.
**Method:** delta audit — every finding deduped against `docs/QA_BUGS.md` (…BUG-353), the RICE backlog (`docs/QA_PERSONA_PRIORITIES_2026.md`), and `docs/ICPS.md` §8; three hard buckets: **NEW** / **KNOWN-STILL-OPEN** / **PREVIOUSLY-FIXED** (re-verified, then dropped or reported as regression). Prior audit docs were treated as leads, never as evidence.
**Evidence key:** `[S]` static file:line · `[L]` live observation (route @ viewport/locale, production build) · `[G]` gate run this session.
**Rubric:** repo conventions only — severity Critical/High/Medium/Low per `.cursor/agents/audit-explore.md`; golden-path steps scored with the amazement rubric (Relief + Specificity + Payoff, 0–2 each; ≤3 ⇒ redesign candidate).
**Round 2:** a same-day stricter pass (uncovered routes, 320px, full native walks, keyboard transcripts, SEO dimension, adversarial re-verification of the Round-1 fixes) follows in the "Round 2" section at the end — findings AUD-60…125.

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
| Native decision-surface content (BUG-110 overlay for winery/attraction data) + drift-gate for tier-1 — **pilot shipped on this branch**: `localizeWineryContent()` overlay (BUG-110 pattern) for the 6 partner wineries × 6 Book-stage fields × 7 locales on the book hub + detail (server surfaces; JSON-LD stays EN base; partner runtime hours win over the locale overlay), guarded by `winery-content.test.ts` across all 7 catalogs; drift gate + `apply-editorial-map` widened to de/el/pl with seeded `editorial-{de,el,pl}.json`. Card surfaces followed in batches 6–7 (`hoursCallAhead` EN-base flag; `/wineries`, `wine-routes/[slug]`, and — batch 7 — `/discover` via per-request section assembly). **Slice 2 shipped (batch 10):** +6 wineries (sterna-boutique — the family-template stop — plus vlassides, kyperounta, vasilikon, fikardos, oenou-yi; picked by template/route relevance and content richness), 252 more catalog strings ×7, tier-1 drift maps seeded for the new keys. Coverage now 12 of 71 wineries. **Slice 3 shipped (batch 12):** the overlay's second content class — `localizeAttractionContent` (same BUG-110 pattern, `data.attractions.*`) for 9 flagship in-template places × winterTip/bestTimeToVisit/openingHours ×7, dispatched with the winery overlay through one `localizeDiscoverContent` entry point on `/discover` and `/discover/[id]` (which also closed a gap: the discover detail never applied the winery overlay — only the book detail did; JSON-LD now explicitly reads the EN base there). Remainder = the rest of the pipeline (59 wineries, remaining attractions/trails/secret-gems) + native review of the shipped ◇ translations | AUD-10, AUD-19, AUD-47, AUD-49 | 8 | 8 | 0.9 | 3 | **19.2** |
| Post-book lifecycle: auto-refetch, status emails, cancel/change path — **shipped** (fix pass: auto re-check on mount + cancel/change guidance; batch 8: guest status email on partner confirm/decline gated on real transitions, dropped offline mutations surfaced). Remaining: a guest-side cancel *action* (product decision — today's path is reply/call, by design) and per-locale status emails (blocked on persisting the guest locale, future migration 008) | AUD-08, AUD-09, AUD-21 | 6 | 8 | 0.9 | 3 | 14.4 |
| Conditions trust loop: as-of surfaces + visible reports + report-void fix — **shipped** (fix pass: "today" reframed + Troodos-scoped home strip + hiker reports on cards/detail; batch 8: dated `TRAIL_CONDITIONS_AS_OF` chip on every editorial-snapshot surface — cards, /trails strip, detail, home strip) | AUD-12 + Anders 3/6 step | 5 | 7 | 0.8 | 2 | 14.0 |
| Locale reachability: switcher entry point in Nav/More + wrong-locale suggestion bar + beta explainer — **shipped on this branch** (batch 6: menu switcher entries, `LocaleSuggestionBar`, beta hint in menus) | AUD-18, AUD-50 | 6 | 6 | 0.8 | 2 | 14.4 |
| Nomad honesty: workation template restructure + coworking/long-stay content (known-open) | AUD-14, ICPS §8 | 4 | 7 | 0.7 | 3 | 6.5 |
| Menu semantics + hub skip-nav consolidation on `useTrapFocus` — **shipped** (batch 6: all three `role="menu"` sites converted to disclosures; batch 7: `HubSkipNav` on `/trails`, `/discover`, `/wineries`, `/events`); only the trap consolidation stays deliberately deferred (different event models; not a defect) | AUD-27 | 4 | 5 | 0.9 | 2 | 9.0 |
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

Audit baseline (`ca827e6`):
```
npm run build                     → exit 0 (compiled 23.4s)
npm run test:a11y                 → exit 0 — 1 passed (2.5m) [31 routes, contrast fatal]
npm run test:e2e:visual-gate:ci   → exit 0 — 17 passed (14.6s)
```

Post-remediation (fix pass, this branch): lint · typecheck · vitest 781 passed ·
i18n validate (7×2320) / scan / editorial-drift · data:validate · build — all green, and
```
npm run test:e2e:gate:ci → exit 0
  core-funnel  38 passed
  ux           44 passed (1 recovered flaky, 1 skipped)
  visual-gate  17 passed
  a11y (axe)    1 passed (31 routes, contrast fatal)
```
One regression was caught and fixed by this very gate during the pass: the new
`SRStatus` live regions (sr-only = `position: absolute`) placed inside wide
horizontal scroll rows expanded `documentElement.scrollWidth` — `SRStatus` is
now pinned `position: fixed`, which never contributes to scroll geometry.
Browser: Chromium 1194 binaries shimmed under the 1234 registry name (pinned CfT 151 egress-blocked in the audit container). A first run failed 18/18 on browser resolution — environmental, excluded.

## Appendix D — Amazement worksheets

Embedded in §3 per persona. Redesign candidates (≤3): Anders trail-report loop (3), Nadia search step (3), **Family template day (2)**.

---

# Round 2 — stricter pass (same day, same branch)

Round 1 was deliberately capped (≈15 findings/lane, ~11 routes walked, 375/768 only, tier-1 locales spot-checked). Round 2 removed the caps and re-ran six lanes at the raised bar: **~20 previously unwalked routes; 320px added** (+1280 funnel pass); **full el/pl native walks + he re-walk of fixed surfaces**; keyboard-only GF1→GF3 transcripts; a **SEO/share/metadata** dimension; and an **adversarial re-verification of every Round-1 fix**. Severity bar raised per plan: any broken funnel step at any supported viewport = High minimum; missing states on a new surface = High; generic-where-primary = Medium minimum.

## 8.0 Round-2 verdict

The Round-1 fixes largely held under attack (§8.1) — but two of them were **less fixed than §0.1 claimed**, and the uncovered surfaces hid 2 more High-class funnel breaks (`/events#id` deep links dead on cold load; the `/wineries` hub's primary CTA pointing at the empty "My bookings" page). The stricter lens produced **66 verified findings (0 Critical, 8 High, ~30 Medium, ~28 Low)** — AUD-60…125 below — of which **44 were fixed and re-validated the same day** (§8.3); the rest are decision/supply items now in the backlog. Instrumented sweep of 60 route×viewport captures: zero bad HTTP statuses, zero missing h1, and (after fixes) **zero horizontal overflow at 320/375/768 including RTL**.

## 8.1 Fix-pass re-verification (lane F2 + C2 adversarial)

11 of 13 sampled Round-1 fixes **held** when attacked at 320px, in `he`, and keyboard-only: ItineraryCard wrap, cookie-banner portal tab order, plan realism warning, GF6 add-failure state, Escape guard, SRStatus announcements, localized server errors, sync-toggle retitle, map overflow, alias search, EventCard chips. Two did not:

- **AUD-06 correction — the "blocked Ask-AI press focuses the banner" fix was dead code.** All 5 open paths route through `triggerAIAssistant()`, which early-returned *without dispatching* when a blocking overlay was active, so the focus branch in `AIAssistant.handleOpen` was unreachable (AUD-87 below; now fixed at the trigger choke point).
- **AUD-41 correction — "Wanderwege" still ellipsized at 375px.** The Round-1 cap raise (56→72px) was 2px short of the label's 74px (AUD-123; cap now 76px, with the ≤360px 56px cap kept as an accepted trade-off — full labels remain in `aria-label`).

Both corrections are themselves fixed and re-verified in this pass. Lesson recorded: a fix that changes *where* logic runs must be re-verified at the *entry point*, not the destination.

## 8.2 Round-2 findings register (AUD-60…125)

Same format and dedupe protocol as §4; every row personally verified. Status: ✅ fixed this pass · ⏳ backlog (decision/supply/project) · ◐ partially fixed (residual noted).

### Lane A2 — previously unwalked surfaces

| ID | Sev | Finding (evidence) | Status |
|---|---|---|---|
| AUD-60 | **High** | `/events#<id>` deep links never scroll on cold load (scrollY stays 0 with target 10–11k px down); warm hash-nav lands cards under the fixed nav. Weather-month pages and `/privacy#cookies` link these anchors. | ✅ `scroll-mt-24` on cards/sections + mount-time hash scroll (reduced-motion-aware), `EventCard.tsx`, `EventsPageClient.tsx`, `privacy/page.tsx` |
| AUD-61 | **High** | `/wineries` hub primary CTA "Book a tasting" linked to `/bookings` (the user's empty status page), not the booking flow (`wineries/page.tsx:81`) | ✅ → `/book/winery` |
| AUD-62 | Med | `/regions/[slug]` hardcoded EN section headings ("Trails", "Villages", "Beaches", "Wineries", "Monasteries & churches") in all 7 locales; `i18n:scan` structurally blind to multi-line JSX text | ✅ 5 headings → `tPage("sections.*")` ×7 locales |
| AUD-63 | Med | Weather hub renders EN month names in every locale — h1, breadcrumb, chips, hero (29× "December", 0× "Dezember" on `/de/weather/december`) | ✅ `monthNames.*` keys ×7; data lookups keep EN keys (`weather/[month]/page.tsx`, `weather/page.tsx`, `locale-metadata-dynamic.ts`) |
| AUD-64 | **High** | Guides directory made un-gated "verified… email confirmation" claims; `guide-partners.ts` filtered on raw `isVerified`, bypassing the AUD-01/BUG-348 `isPartnerVerified()` gate | ✅ helpers now gate on `isPartnerVerified()`; directory intro/CTA reworded to "licensed" ×7 (unit test updated to assert the gate) |
| AUD-65 | Med | Soft 404s: every invalid dynamic slug (7 routes verified) serves the not-found page with HTTP 200 — streaming shell commits status before `notFound()` | ⏳ **architecture constraint, experiment recorded:** `dynamicParams=false` is inert because every route renders dynamically — the root layout's `getLocale()` (cookie-based locale on unprefixed URLs) forces request-time rendering, and `setRequestLocale` on pages can't override the root. Real 404s need a locale-detection redesign (= AUD-113) |
| AUD-66 | Med | `/install` is a developer deployment guide shipped as a public 7-locale route; `sitemap.ts` listed it while robots+meta forbid indexing | ◐ sitemap entry removed; route content is a product decision |
| AUD-67 | Med | Legal/GDPR contact addresses live on the unattached `cypruswinter.com` domain (no MX) — privacy/terms advertise unreachable mailboxes | ⏳ supply: needs a real mailbox |
| AUD-68 | Med | Mega-hub flat scrolls at 375px: `/wineries` 47,974px, `/secrets` 33,989px, `/villages` 30,123px — zero facets or in-page nav (unlike `/discover`, `/events`) | ✅ shared `HubRegionFilter` chips on all three (progressive enhancement — server renders every card, the bar shows/hides via `data-hub-group`, live count announced; measured: wineries 44k→26k px on the largest region, villages 28k→10k, secrets 34k→12k) |
| AUD-69 | Med | Region hub lede is keyword-stuffed meta copy rendered as the visible intro, EN-only ×7 (`regions.ts` feeds both metadata and PageHeader) | ✅ human titles + intros written ×5 regions ×7 locales (`regions.page.regions.*`); visible header uses them everywhere; EN metadata keeps the keyword copy for snippets, non-EN metadata now localized |
| AUD-70 | Low | Guides directory: "221 licensed guides" intro vs "158 guides" list on one screen — locale-language pre-filter never explained | ✅ "{count} of {total} — filtered" line ×7 whenever a filter (incl. the locale pre-filter) narrows the list; de noun fixed to "Gästeführer" |
| AUD-71 | Low | 14 wineries carry `wineRoute` values matching no route page ("Laona–Akamas", "Pitsilia"…) — invisible to the wine-route feature; no `data:validate` rule ties them | ✅ `wineriesForRoute()` substring resolver (Laona–Akamas now on both pages; laona 17→18, akamas 3→4, incl. localized metas that were also hardcoded EN) + `data:validate` guard: values must match a page or the documented no-page allowlist; official pageless routes stay as data |
| AUD-72 | Low | Privacy/Terms "Last updated: March 2026" hardcoded, 6 months stale | ⏳ editorial |

### Lane B2 — booking deep states, auth, partner

| ID | Sev | Finding | Status |
|---|---|---|---|
| AUD-73 | **High** | Post-submit success panel still promised partner email confirmation for **unverified** partners — contradicting the trust strip shown 30s earlier | ✅ success body/next-steps/emailDelayed gated on `isPartnerVerified`; honest `successUnverified` copy ×7; stepper stays at step 2 |
| AUD-74 | **High** | AUD-08's auto-status-check disabled itself after first run: the sync merge overwrote local bookings with the API's email-stripped public view (lost `guestEmail`/`guestName`/`notes` → no future auto-checks) | ✅ field-wise `mergePreferringApi()` keeps non-empty local fields (`bookings-storage.ts`, unit-tested) |
| AUD-75 | **High** | Fallback trust copy said "call the guide or use their booking link below" — guide phones are suppressed and 6/7 guides have no link; only `tel:` on page were 112/1460/199 | ✅ reworded ×7 + directory fallback link on unverified guide pages (`book/guide/[id]/page.tsx`) |
| AUD-76 | Med | Progress stepper filled "Partner confirms" (3/3) solid at submission while the booking is pending | ✅ `currentStep={2}` on success (hollow step 3) |
| AUD-77 | Med | Booking honeypot was dead code: API checks a `website` field no form rendered | ✅ honeypot field + JSON passthrough in both forms (SR-invisible, `tabIndex=-1`, static 1px clip — no absolute positioning per the SRStatus scroll-geometry lesson) |
| AUD-78 | Med | Offline queue drain delivered the request but (a) never added the booking to local storage and (b) left the "will be sent" alert up after delivery | ✅ drain stores the returned booking (unit-tested) and fires a drained event; mounted forms swap the stale offline message for the success state |
| AUD-79 | Med | Booking 429 ignored its own `Retry-After: 53`: "wait a moment" copy, no countdown, submit stayed enabled | ✅ header parsed, 1s countdown `role="status"`, submit disabled until 0 (`useBookingForm.ts`) |
| AUD-80 | Med | Server `VALIDATION_ERROR` genericized to "Something went wrong" — dropped the actionable reason; EN passthrough when a code was unmapped | ◐ per-code messages incl. `NOT_FOUND`/`IDEMPOTENCY_CONFLICT`, no EN passthrough (falls to localized generic); per-field highlight from server errors deferred |
| AUD-81 | Med | Partner portal misreports its own state: unconfigured backend (503) surfaces as "Email or secret is not recognised" | ◐ status-mapped copy ×7 (503 "not set up yet", 429 wait, 401/403 credentials, else generic; verified live) — the partner-onboarding path itself remains a product decision |
| AUD-82 | Med | `/bookings` says "set a reminder if you like" but offers no add-to-calendar while `/plan` ships ICS | ✅ per-booking "Add to calendar" ICS (`booking-ics.ts`), labels ×7 |
| AUD-83 | Low | Status vocabulary split: form promises "requested", every badge says "pending" | ✅ states copy unified on "pending" ×7 |
| AUD-84 | Low | `AuthPasswordInput` show/hide toggle `tabIndex={-1}` — keyboard users can never reveal the password (latent while auth unconfigured) | ✅ removed |
| AUD-85 | Low | `/forgot-password` unconfigured state wears the reset page's copy ("Use the reset link from your email") for users who came to request one | ✅ own config copy ×7 + link to the bookings email lookup |
| AUD-86 | Med | Guide bookings lose their trail: chosen trail lives only in free-text notes (which the old merge stripped — AUD-74), card shows no trail, "View trails" generic | ✅ `trailId` on the booking record end-to-end (API → local storage; no DB column needed — future migration 008 noted); `/bookings` cards show the trail, "View trail" links to it, change/book-again preselect it |

### Lane C2 — keyboard & structure

| ID | Sev | Finding | Status |
|---|---|---|---|
| AUD-87 | **High** | AUD-06 correction (§8.1): blocked Ask-AI press was still a silent no-op — the focus-the-banner fix was unreachable dead code | ✅ focus logic moved into `triggerAIAssistant()` (the choke point all 5 paths use) |
| AUD-88 | Med | Discover-card "+" quick-add unmounted under focus with no handoff/announcement (AUD-07 covered `AddToItineraryButton` only) | ✅ duplicate "+" removed entirely (see AUD-90) |
| AUD-89 | Med | AI drawer opened from the mobile menu lost focus to `<body>` on Escape (restore target unmounted with the menu) | ✅ fallback to the nav toggle when `previouslyFocusedRef` is disconnected |
| AUD-90 | Med | Every card cost 3 tab stops (~120 through `/discover`): card link + "Add to plan →" + duplicate "+" with identical action | ✅ duplicate removed → 2 stops/card |
| AUD-91 | Med | Primary CTAs at conversion moments rendered 44px against the repo's own 48px primary rule (QA_PLAN §2.5): detail add-to-plan, plan combos, home cards | ✅ `CTA.primaryCompact` → `min-h-[48px]` |
| AUD-92 | Low | `/plan` native date-input segments could show zero focus indication (2 of 8 segment stops) | ✅ `focus-within` ring on the wrappers (`PlanTripDatesWidget.tsx`) |
| AUD-93 | Low | "← Home" (BackLink) + "Home" (Breadcrumbs) adjacent duplicate tab stops on padded pages | ✅ deduped in `PageHeader` + `ListPageHero` (deeper crumbs keep their non-duplicate items) |

### Lane D2 — tier-1 native walks (el/pl full, he re-walk, de@320)

| ID | Sev | Finding | Status |
|---|---|---|---|
| AUD-94 | Med | Cookie `srAnnounce` named buttons that don't exist in 5/7 locales (de "Nur notwendige" vs button "Nur essenziell", pl/he/ro/fr similar) | ✅ aligned ×5 |
| AUD-95 | Med | `requestLoggedFallback` `{context}` interpolation ungrammatical in el/he/ro — renders on **every** booking form (el "καλέστε το οδηγού" garbled; he "אל שותף" = "a partner") | ✅ el accusative "τον {context}" + "ξεναγό", he "ה{context}", ro rephrased |
| AUD-96 | Med | New he SLA range "24–48" rendered visually reversed ("48–24") in RTL | ✅ LTR isolates (U+2066/U+2069) around numeric ranges |
| AUD-97 | Med | Greek misspelling "Λευκάρια" for Λεύκαρα in shipped combo copy | ✅ corrected (el-wide sweep) |
| AUD-98 | Med | `AttractionCard` aria-label + img alt hardcoded EN template literals in all locales ("Nissi Beach, Παραλία in Ayia Napa") — `i18n:scan` blind to attribute template literals | ✅ `common.aria.placeCard`/`placeCardImageAlt` keys ×7 |
| AUD-99 | Med | Finite data enums (activities, difficulty, route type) interpolated raw into localized sentences → "Ιδανικό για shopping and crafts", "7 km szlak easy" | ◐ difficulty labels (batch 3) + routeType chips (loop/out-and-back/point-to-point ×7, card + detail) localized; free-text activities/bestFor remain the AUD-10-class residual |
| AUD-100 | Med | 90× `nameEl` exists in data but no card/list surface used it — `/el` read translated-tourist exactly where ICPS §6.1 demands Greek-first | ✅ `AttractionCard`, `TrailCard`, `SearchResultCard` and `ItineraryCard` (via `nameEl` carried through `PlanItem`) all render `getLocalizedName()` |
| AUD-101 | Low | Greek AI-assistant voice informal singular vs the app's formal σας (de correctly uses Sie) | ✅ 5 opener strings formalized |
| AUD-102 | Med | el mixed "οδηγός" (driver/guidebook) with "ξεναγός" (licensed guide) after the AUD-01 rewording — both in one sentence on the hub | ✅ `ξεναγ` sweep over guide surfaces |
| AUD-103 | Low | Guides hub footer dropped "and add stops to your plan" in de/el/pl | ✅ restored ×3 |
| AUD-104 | Low | AUD-41 residual at ≤360px (see AUD-123) | ◐ 56px cap kept ≤360 by design; full label in aria |
| AUD-105 | Low | de ◇-flags: "Share-Link in die Zwischenablage kopiert", calqued verifiedRoute | ✅ "Link zum Teilen kopiert" etc. (U+2011 "E‑Mail" kept — file-wide convention, not drift) |
| AUD-106 | Low | pl ◇-flags: "trasa zapytania" calque (trasa = physical trail); "przez email"/"e-mail" split on one screen | ✅ "ścieżka" + e-mail normalized |
| AUD-107 | Low | he register split singular-masculine vs plural-neutral on one screen, incl. new strings | ◐ new-batch strings pluralized; app-wide register unification is an editorial project |
| AUD-108 | Low | pl home hero addressed every user as male ("Właśnie przyleciałeś?") | ✅ de-gendered ("Dopiero po przylocie?") |
| AUD-109 | Low | fr/ro ◇-flags: straight apostrophe, masculine-default "sûr", noun-stack verifiedRoute | ✅ |
| AUD-110 | Low | el ◇-flags: unidiomatic "ωράριο… μικρότερο" (idiom: μειωμένο ωράριο), accented month abbreviations | ✅ |

### Lane E2 — SEO / share / metadata

| ID | Sev | Finding | Status |
|---|---|---|---|
| AUD-111 | **High** | Plan ICS wrote a literal `\n` between places (pre-escaped join, then `escapeIcsText` re-escaped) — calendars show "Lefkara (Larnaca)\nOmodos" | ✅ join with real newline; 2-place unit test |
| AUD-112 | Med | Share links dropped the locale — localized share text wrapped an EN landing URL (`/he/plan` verified) | ✅ `localizedPathname()` on `sharePath` (`useItinerary.ts`) |
| AUD-113 | Med | Soft-404 (= AUD-65, SEO surface) | ⏳ |
| AUD-114 | Med | Homepage Twitter card leaked onto every page without its own twitter block (og correct, twitter wrong) | ✅ layouts slimmed to `twitter: { card }` only |
| AUD-115 | Med | Book pages: zero `og:*` tags; root cause `applyLocaleToMetadata` only emits og when the base builder provides it | ✅ og builders for book/winery + book/guide (title/description/type/image) |
| AUD-116 | Med | Events JSON-LD: 26 Events, none with `startDate` (invalid for rich results); zero invented dates — discipline held | ✅ truthful `eventSchedule.byMonth` from the month field; still no fabricated dates |
| AUD-117 | Med | Canonical split-brain: `/el` home Strategy A vs locale subpages Strategy B; sitemap unprefixed-only (474 URLs); two parallel helper modules | ✅ `docs/INTERNATIONAL_SEO.md` already adopts Strategy A — `locale-seo.ts` was simply violating it; canonical + og:url now the unprefixed default-locale URL everywhere (verified live on `/el/discover/lefkara`), hreflang cluster unchanged, tests updated |
| AUD-118 | Med | `meta.homeTitle/homeDescription` a copy generation behind in all 6 non-EN; ro/fr/he served stale **English** titles live | ✅ retranslated ×6 |
| AUD-119 | Low | Winery JSON-LD hygiene (relative image URL, prose openingHours, locality in addressRegion) | ✅ absolute image, `addressLocality`, non-spec prose hours dropped from markup (visible page keeps them) |
| AUD-120 | Low | JSON-LD descriptions truncated mid-word without ellipsis | ✅ shared `truncateForSchema()` (word boundary + …) in all three schema builders |
| AUD-121 | Low | 6 meta descriptions >160 chars (worst `/el/plan` 215) | ◐ catalog-wide sweep found ~70; the 26 worst (>185 chars, incl. `/el/plan` 215→150) and both over-length el titles trimmed ×6 locales (also fixed el meta "οδηγό"→"ξεναγό" and fr/ro "verified"→licensed residue); 161–185 accepted — word-boundary truncation |
| AUD-122 | Low | `og:locale` bare codes ("he" not "he_IL"); detail `og:type` omitted | ✅ territory-qualified `og:locale` map injected by `applyLocaleToMetadata` + layouts; `og:type` article on discover/trail details |

E2 verified-fine (not re-flagged): hreflang 7+x-default complete; share strings ×7 no EN leaks; sitemap 474 URLs sane; robots sane; og:images resolve; AUD-01 JSON-LD phone gating held; BUG-165/175 escaping held.

### Lanes F2/O2 — corrections & instrumented sweep

| ID | Sev | Finding | Status |
|---|---|---|---|
| AUD-123 | Med | AUD-41 correction (§8.1): "Wanderwege" needed 74px, cap was 72px — still ellipsized at 375 | ✅ cap → 76px (≥360px); ≤360px keeps 56px by design |
| AUD-124 | Med | `/plan` timeline cards get 182px of a 320px viewport (double start-gutter ≈96px); readable but cramped | ✅ ≤360px timeline column slims (24px badge, 8px gap) — cards re-measured at 198px, 0 overflow |
| AUD-125 | Med | `/search` 6px horizontal overflow at 320px — two stacked causes: the in-plan chip's `inline-flex flex-wrap` min-content resolving unwrapped, and `truncate` (nowrap) card text setting the grid track's min-content to the full line | ✅ `max-w-full` on the chip **and** `truncate` → `line-clamp-1 break-words` in `SearchResultCard` (re-measured: 0px overflow, all 8 spot routes) |

## 8.3 Round-2 remediation status

**Fixed and re-validated this pass (44 + a same-day backlog batch, below):** AUD-60…64, 66 (sitemap half), 73…80 (78/80 partial), 83, 84, 87…92, 94…98, 100 (AttractionCard), 101…103, 105, 106, 108…112, 114…116, 118, 123, 125 — plus the pl e-mail normalization and the two §8.1 corrections. i18n catalog now **7 × 2338 keys**, parity-validated, editorial maps auto-synced.

**Backlog batch (same day, follow-up commit):** AUD-70, 78-residual, 82, 85, 93, 100-residual, 119, 120, 122 and 124 closed — per-booking calendar ICS, drained-queue → form success signal, native place names on every card surface (`nameEl` carried through `PlanItem` + regenerated index), breadcrumb/back-link dedupe, forgot-password copy ×7, filtered-count honesty in the guides directory (+ de "Gästeführer" terminology), JSON-LD/og hygiene (absolute winery image, `addressLocality`, word-boundary truncation, territory-qualified `og:locale`, detail `og:type`), and the ≤360px plan-gutter collapse. TrailCard/trail aria also localize the difficulty label (partial AUD-99), and TrailCard swaps `truncate` → `line-clamp-1` (AUD-125 class).

**Batch 3 (same day, third commit):** AUD-71, 81 (states half), 86, 121 (worst offenders) closed — see the register rows. AUD-65/113's designed fix was experimentally disproven: `dynamicParams=false` + `setRequestLocale` cannot produce real 404s while the root layout's cookie-based `getLocale()` keeps every route request-rendered; it stays open as an architecture decision with the evidence recorded.

**Batch 4 (same day, fourth commit):** AUD-68, 69, 117 closed and 99 advanced (routeType) — see the register rows. Catalog 7×2364.

**Batch 5 (same day, fifth commit) — the AUD-10 / RICE-19.2 pilot:** winery Book-stage content localized via the BUG-110 message-overlay pattern for the 6 partner wineries ×7 locales (`data.wineries.*`, 252 catalog strings; non-EN flagged ◇ pending native review per ICPS §6.1), server surfaces only, with the editorial-drift gate extended to tier-1 de/el/pl. Verified live: Greek tastingInfo/winterTip on `/el/book/winery/tsiakkas`, Sie-register German hours on `/de`, bidi-isolated times on `/he`, EN JSON-LD and non-pilot cards unchanged. Catalog 7×2400.

**Batch 6 (same day, sixth commit) — locale reachability, menu semantics, card-surface unlock:**
- **AUD-18/50 shipped (RICE 14.4 row):** the locale switcher now lives in the desktop More panel and the mobile menu (`LocaleLinks` `variant="menu"` + `common.localeSwitchHeading` ×7), with the existing "(beta)" affix + hint riding along; new `LocaleSuggestionBar` handles the prefixed-deep-link case (browser-language ≠ page locale → dismissible bar in the *target* language; verified live: de browser on `/el/discover` → "Diese Seite gibt es auch auf Deutsch." → `/de/discover`, dismissal persists). The bar's copy is a deliberate per-locale in-component map — its audience doesn't read the current locale's catalog.
- **AUD-27 shipped (roles half):** all three `role="menu"` sites are now plain disclosures (`aria-expanded`/`aria-controls`, `<ul>/<li>`, `aria-haspopup` dropped); Escape/tab-cycle behavior unchanged. The hand-rolled-trap consolidation onto `useTrapFocus` is deliberately deferred (different event models; not a defect).
- **AUD-10 card surfaces unlocked:** `hoursCallAhead` is now decided on the EN base at overlay/projection time, so the call-ahead badge survives translation (verified live: "Καλέστε πρώτα ·" on the Greek Dómes Sergiou card); the pilot overlay + partner-hours precedence now runs on `/wineries` hub cards and `wine-routes/[slug]` (page + bookable stops), and `DiscoverCardItem` carries `nameEl` (Greek-first card titles on `/el/discover`) + the flag. The `/discover` *content* overlay stays open — its sections are module-level constants and need per-request assembly first.
- **Template notes surfaced:** `bookingNote` was populated in `itinerary-templates.ts` since day one but never rendered; now localized ×7 (`planQuick.templates.items.*.bookingNote`) and shown on plan template cards; `TemplateChoiceModal` stops interpolating the EN `label` into localized titles (AUD-99 class).

**Batch 7 (same day, seventh commit) — `/discover` content overlay, hub skip-nav, seasonal notes:**
- **AUD-10 `/discover` unlocked:** the discover sections are no longer module-level constants — `buildCardSections()` assembles them per request (the page was already request-rendered via the root layout's `getLocale()`), applying `applyPartnerOpeningHours(await localizeWineryContent(w))` to winery items before the lean projection, and `toDiscoverCardItem` now prefers the precomputed EN-base `hoursCallAhead` over recomputing on localized text (unit-guarded). Verified live: Greek tsiakkas winterTip on `/el/discover?filter=winery` with the call-ahead badge intact, EN untouched, JSON-LD still EN base. Live partner hours now also reach `/discover` (they never could while the sections were module constants).
- **AUD-27 completed (skip-nav half):** new shared `HubSkipNav` (HomeSkipNav pattern — hidden until focused, focus-within reveal) on `/trails` (`#trail-list` + `#trails-map`), `/discover` (`#discover-content`), `/wineries` (`#wineries-list`), `/events` (new `#events-content` anchor); `common.skipTo.{results,map}` ×7 following each locale's existing "Skip to …" phrasing. Verified live: focus reveals the panel on-screen; all targets resolve. The `/trails` ~26–30-tab-stop path to the first card is now 1 activation. Only the `useTrapFocus` consolidation remains deferred (not a defect).
- **`seasonalNote` surfaced:** the tour-operator pacing notes (daylight windows, icy-trail warnings, rainy-day swaps — curated in `itinerary-templates.ts` since day one, never rendered) now appear as a dismissible `PlanSeasonalTip` strip after a template is applied, on every application path (card click on empty plan, add/replace modal, `?template=` URL), session-only by design; localized ×7 (`planQuick.templates.items.*.seasonalNote` + `seasonalTip.*`, non-EN ◇). Verified live: Greek note + kicker on `/el/plan` after applying Short stay, dismiss works, URL-applied `?template=mountain` shows it too, 0px overflow at 320. Catalog 7×2421.

**Batch 8 (2026-09-01, eighth commit) — the last two open RICE projects (14.4 + 14.0):**
- **AUD-08 status emails:** partner confirm/decline now sends the guest a status email (`sendBookingStatusEmail`, Resend-gated like every sender). `updateBookingStatus` returns a `changed` flag so the idempotent same-status retry never re-sends (unit-guarded); email failure never fails the update, and the PATCH response carries `statusEmailSent`. Copy ×7 under `email.status.*`; sent in the default locale until a guest locale is persisted (same schema gap as `trail_id` — future migration 008; keys are ready).
- **AUD-21 dropped-mutation visibility:** the offline queue's permanent discards (non-retryable 4xx on drain) now dispatch `OFFLINE_QUEUE_DROPPED_EVENT`; a mounted booking form that queued offline swaps its stale "will be sent when you're back online" promise for a visible error (`errors.offlineDropped` ×7) and resets its idempotency key so a corrected resubmission is a fresh request, not a payload-mismatch conflict.
- **AUD-12 as-of chip:** the editorial snapshot's date finally renders — new `TRAIL_CONDITIONS_AS_OF` in `src/data/trails.ts` (update with any snapshot refresh) + `formatMonthYear`, shown on every surface that summarizes or renders the static snapshot: trail cards' "Winter snapshot" line, the /trails conditions strip (its counts are editorial-only — verified in `useTrailsFilter`), the trail-detail editorial branch, and the home Troodos strip. Verified live ×7-ready: 41 occurrences on `/trails` (40 cards + strip), "ενημέρωση: Μάιος 2026" on `/el/trails`, "Stand: Mai 2026" on `/de/trails`, chip on `/` and `/trails/artemis`. Catalog 7×2433.

**Batch 9 (2026-09-01, ninth commit) — the executable Round-1 leftovers (AUD-11/46/48/56/59):**
- **AUD-59:** `/events` now anchors "now" — in season the current month leads (month nav, sections, and the "Don't miss" highlights all follow the rotated order; earlier months wrap to the end as next winter's); out of season the Nov-first planning order stays. The anchor is computed server-side per request and passed down, so SSR and hydration agree; the rotation is invisible out of season, so it's pinned by `events-month-order.test.ts` (logic extracted to `season-months.ts`).
- **AUD-48:** booking jargon de-jargoned ×7 — "Booking states:" → "How your request progresses", "queued as sync pending" → plain saved-and-sent-when-back-online copy, "when delivery is available" → "once email sending is enabled" (winery + guide success step 1). The fr/he/ro editorial maps re-pinned to the new strings (the drift gate caught the edit, as designed).
- **AUD-46:** the "Verified partner" claim is no longer desktop-tooltip-only — the winery booking page shows the explanation as visible text under the badge, and the card badge carries it for screen readers (`sr-only`).
- **AUD-56:** ad-hoc z-indexes moved onto the LAYER scale — two new documented tokens (`nextOnPlan: z-20`, `mapOverlay: z-[5]`), `ContextualHelp` now uses `LAYER.popover`, and all 10 map-overlay sites across the 5 map components use `LAYER.mapOverlay`. No raw `z-[45]`/`z-20`/`z-[5]` literals remain outside the token file.
- **AUD-11:** search result cards gained a winter cue / price hint from data the index already holds (no new client payload): trails show length + localized difficulty, places show the call-ahead flag and a "from €N" cheapest listed tasting where one exists (`wineryPriceFrom` over `signatureWines`); trail/event results also carry `nameEl` now, so Greek-first names reach search. New `common.fromPrice` ×7. Catalog 7×2434.

**Batch 10 (2026-09-01, tenth commit) — AUD-10 slice 2:** the winery content overlay extends from the pilot 6 to 12 of 71 wineries — sterna-boutique (the family template's tasting stop, whose bookingNote already pointed readers at it) plus the five richest-content high-relevance estates (vlassides, kyperounta, vasilikon, fikardos, oenou-yi). 252 new catalog strings ×7 locales following the pilot registers (de *Sie*, el imperative-plural with Greek toponyms, he plural + LTR-isolated times/prices, fr *vous* with French spacing, ro formal); EN mirrors data verbatim (guard test); tier-1 editorial maps (de/el/pl) seeded with all 36 new keys so future edits trip the drift gate like the pilot's. No code changes beyond the coverage set — every surface shipped in batches 5–7 (book hub/detail, `/wineries`, wine routes, `/discover`) picks the new ids up automatically. Verified live: Greek vlassides tasting menu and fikardos winter tip, German kyperounta snow warning, Hebrew sterna-boutique cave line; EN base and JSON-LD unchanged. Catalog 7×2470.

**Batch 11 (2026-09-01, eleventh commit) — adversarial self-review remediation.** A high-effort code review over the whole branch diff surfaced 8 findings; all remediated:
- **Missing key (real render bug):** `bookings.page.cta.viewTrail` was referenced for the booked-trail CTA but never existed in any catalog (only `viewTrails`) — a guide booking with a chosen trail rendered the raw key. Added ×7.
- **Fail-open drain ordering:** on a mixed offline drain (another mutation delivers, this booking permanently rejected) `DRAINED` fired first and showed the success screen for the rejected booking. `DROPPED` now fires first, and both events carry the affected mutation `types` so each form reacts only to its own queue type (new mixed-drain unit test).
- **Hidden-button focus fallback:** `AIAssistant`'s close fallback focused the first `nav button[aria-expanded]` — the desktop More button, `display:none` on mobile, so focus still dropped to body in the exact mobile-menu scenario the fallback targets. It now picks the first *visible* candidate.
- **Banner leak from the silent auto-check:** the mount-time booking status refresh reused the email-lookup path and could set "No bookings found…"/"Loaded N" banners the user never asked for. `applyRemoteBookings` gained a `silent` mode for background refreshes.
- **Honeypot vs form-fillers:** the anti-bot `website` field could be filled by password-manager autofill, silently swallowing a real booking. Added `autoComplete="one-time-code"` plus the 1Password/LastPass/Bitwarden opt-out attributes on both forms (residual risk documented in-code).
- **Two dedups:** RFC 5545 escaping now lives once in `src/lib/ics.ts` (both plan and booking builders import it — the E2E-01 double-escaping bug class), and the 7-code `apiByCode` mapping moved to a shared `useApiErrorMessages()` hook (was copy-pasted across both forms).
- **i18n rule violation:** `LocaleSuggestionBar`'s 7-language copy was hardcoded in the component, invisible to every i18n gate. Moved to `common.localeSuggest.*` ×7; the root layout assembles the per-target-locale map server-side and passes it down, so the bar still renders in the *target* language (verified live: German copy on `/el/discover` under a de browser). Catalog 7×2475.

**Batch 12 (2026-09-01, twelfth commit) — AUD-10 slice 3: the attraction overlay pilot.** The content pipeline's second class: `attraction-content.ts` + `attraction-content-ids.ts` mirror the winery overlay (server-only, id-gated, `hoursCallAhead` decided on the EN base) for 9 flagship in-template places — kourion, pafos-mosaics, omodos, lefkara, kykkos, fig-tree-bay, governors-beach, konnos-bay, kakopetria — × winterTip/bestTimeToVisit/openingHours ×7 locales (26 EN strings mirrored, 156 ◇ translations). A new `localizeDiscoverContent` dispatcher (disjoint id sets, guard-tested) serves both overlays on `/discover` and `/discover/[id]` — and closed a discovered gap: the discover detail page had never applied the winery overlay (only the book detail had); its JSON-LD now explicitly reads the EN base record while the rendered record localizes. Guard suite mirrors the winery one (9 tests ×7 catalogs); tier-1 drift maps seeded with all 26 keys. Catalog 7×2501.

**Batch 13 (2026-09-01, thirteenth commit) — AUD-10 slice 4: full itinerary-template coverage.** `LOCALIZED_ATTRACTION_IDS` extends to the remaining 10 in-template attractions with populated Book-stage fields (coral-bay, tomb-of-kings, choirokoitia, cyprus-museum, leventis-museum, polis, pedoulas, platres, lofou, machairas) — 20 EN strings mirrored, 120 ◇ translations, zero code changes (the slice-3 machinery and guard suite pick the ids up automatically; tier-1 drift maps seeded). **Every place an itinerary template routes a visitor through now serves its winter tips, best-time advice, and hours natively ×7.** Catalog 7×2521.

**Batch 14 (2026-09-01, fourteenth commit) — AUD-10 slice 5: top non-template attractions.** The 10 highest-relevance places outside the templates join the overlay — nissi-beach, kolossi, kition, larnaca-aliki (the flamingo season), lara-bay, limassol-marina, ayia-napa-sea-caves, st-sozomenos, panagia-asinou, st-john-lampadistis. 28 EN strings mirrored, 168 ◇ translations, zero code changes; tier-1 drift maps seeded. Attraction coverage: 29 places. Catalog 7×2549.

**Batch 15 (2026-09-01, fifteenth commit) — AUD-10 slice 6: next 8 wineries.** mystes, loukas, ktima-vassiliades, komos, avakas, aes-ambelis, kalamos, christoudia join the overlay (48 EN strings mirrored, 288 ◇ translations — recurring lines like "By appointment; call ahead Nov–Mar." share one translation per locale). Zero code changes; tier-1 drift maps seeded. Winery coverage 20 of 71. Catalog 7×2597.

**Batch 16 (2026-09-01, sixteenth commit) — AUD-10 slice 7: painted churches, northern castles, ancient sites.** 10 more places join the overlay — the UNESCO painted-church circuit (panagia-tou-moutoulla, panagia-tou-araka, st-nicholas-roof, archangelos-michail) plus chrysorrogiatissa, the northern castles (st-hilarion, buffavento — border-access caveat now native ×7), gerakopetra-boulders, angeloktisti, idalion. 20 EN strings mirrored, 120 ◇ translations (the DMT winter-hours line shares one translation per locale); zero code changes; tier-1 drift maps seeded. Attraction coverage 39 places. Catalog 7×2617. Observed once: an unrelated cross-test env-stub intermittent in `api/chat/unavailable.test.ts` (passes in isolation and on re-run) — noted for a future test-isolation pass.

**Batch 17 (2026-09-01, seventeenth commit) — AUD-10 slice 8: the attraction class is complete.** The final 19 attractions with ≥2 populated Book-stage fields join the overlay — athalassa-forest-park, mackenzie-larnaca-coast, agros, koilani, palaipafos, kalopanagiotis, foini, stavrovouni (women-may-not-enter caveat now native ×7), salamis + bellapais (the north-access caveats native ×7), tzelefos-bridge, st-george-alamanou, fikardou, cape-greco-climbing, st-neophytos, trooditissa, troodos-cycling-hub, paphos-castle, amahti. 38 EN strings mirrored, 228 ◇ translations (shared lines — the north-hours caveat, the winter-daily 8:30 line, the Dec–Mar 10–15 line — get one translation per locale); zero code changes; tier-1 drift maps seeded. **Every attraction meeting the ≥2-field threshold (58 places) now serves winter tips, best-time advice, and hours natively in all 7 locales.** Catalog 7×2655. Also in this batch: the batch-16 chat-test intermittent root-caused — `api/chat/unavailable.test.ts` and `api/bookings/route.test.ts` both sent `x-forwarded-for: 127.0.0.91`, and the in-memory rate limiter is shared per vitest worker, so file order could turn the chat request into a 429; the chat test now uses a unique IP (127.0.0.191) with a comment pinning the constraint.

**Batch 18 (2026-09-01, eighteenth commit) — AUD-10 slice 9: next 10 wineries by content richness.** ayia-mavri, meletiou, makarounas, argyrides, cholettis, adege, stavrinos, ambeli, lambouri, nichteri join the overlay — 55 EN strings mirrored, 330 ◇ translations. Recurring lines reuse the exact translations shipped in earlier slices ("By appointment; call ahead Nov–Mar.", "On-site."); two new shared lines (winter-hours call-ahead, most-days tastings) get one translation per locale. Zero code changes; tier-1 drift maps seeded. Winery coverage 30 of 71. Catalog 7×2710.

**Batch 19 (2026-09-01, nineteenth commit) — AUD-10 slice 10: next 10 wineries + the Commandaria museum.** sodap, iona, tsangarides, savvas, monagri, silikou-museum, hadjicharalambous, semeli, zambeli, krasas join the overlay — 49 EN strings mirrored, 294 ◇ translations. Two new shared lines (Dec–Mar call-ahead, Koilani/Krasochoria transport) get one translation per locale; established shared lines reused verbatim. Zero code changes; tier-1 drift maps seeded. Winery coverage 40 of 71. Catalog 7×2759.

**Batch 20 (2026-09-01, twentieth commit) — AUD-10 slice 11: ten more wineries across five districts.** agios-theodoros, fikardou-winery, sygkrasi, syndesmos, petrides, makrikontas, yiannis, dafermou, nicolaides, solia join the overlay — 54 EN strings mirrored, 324 ◇ translations, with heavy shared-line reuse (all 10 opening-hours entries are the established by-appointment line; new by-appointment/Dec–Mar short variants get one translation per locale). Zero code changes; tier-1 drift maps seeded. Winery coverage 50 of 71. Catalog 7×2813.

**Remaining backlog (decision/supply/project):** AUD-65/113 (locale-detection redesign), 67 (real legal mailbox), 72 (legal "last updated"), 81-residual (partner onboarding path), guest-side cancel action + persisted booking locale (migration 008), the AUD-10 content pipeline beyond slice 11 (21 wineries + trails/secret-gems — the attraction class is done), AUD-23 (guide price signal — needs real guide prices, supply), AUD-26 (partner-overlay persistence — needs a table/migration), AUD-58 (family-lane curation — editorial), 104/107 residuals, 121-residual (161–185-char metas, accepted), `useTrapFocus` consolidation (deferred, not a defect), he register sweep, native review of all ◇ translations shipped on this branch.

## 8.4 Persona × dimension grid (16 QA personas, post-R2-fix)

Scores 1–5 per `docs/QA_PERSONAS_FULL_STACK_2026.md` layers; scored against this branch after the Round-2 fixes. Return column = post-book/repeat loop.

| Persona | Market fit | Trust | Discover | Plan | Book | Return | i18n | Mobile | A11y | SEO |
|---|---|---|---|---|---|---|---|---|---|---|
| UK-01 Margaret & David | 4 | 4 | 4 | 3 | 4 | 3 | 5 | 4 | 4 | 4 |
| PL-01 Kasia & Tomasz | 4 | 4 | 4 | 3 | 4 | 3 | 4 | 4 | 4 | 3 |
| IL-01 Yael & Omri | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3 |
| GR-01 Nikos | 3 | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 3 |
| DE-01 Stefan & Lena | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 4 |
| DE-02 Anna | 4 | 4 | 4 | 3 | 4 | 3 | 4 | 4 | 4 | 4 |
| NORD-01 Oskar & Ingrid | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 4 |
| RO-01 Andrei & Elena | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3 |
| UK-02 James | 4 | 4 | 4 | 4 | 4 | 3 | 5 | 4 | 4 | 4 |
| A11Y-01 Priya | — | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | — |
| PERF-01 Marcus | — | 4 | 4 | 4 | 4 | 4 | — | 4 | — | 4 |
| B2B-01 Elena V. | 3 | 3 | — | — | 3 | 2 | 4 | 4 | — | — |
| LB-01 Rina | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3 |
| FR-01 Claire | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 4 | 3 |
| US-01 Sam | 4 | 4 | 4 | 4 | 4 | 3 | 5 | 4 | 4 | 4 |
| CRISIS-01 Composite | 4 | 4 | — | 4 | 4 | — | 4 | 4 | — | 4 |

Grid notes (what still holds scores down): Return ≤3 everywhere = post-book loop gaps (AUD-81/82/85/86); GR-01 i18n 3 = enum mixing + native-name residual (AUD-99/100); B2B-01 Return 2 = partner portal dead end (AUD-81); PL/IL/GR/RO/LB/FR SEO 3 = canonical split-brain + meta length (AUD-117/121). GR-01 Market fit 3 = Local content depth (KNOWN, §5). Amazement re-scores on newly walked flows: weather-month 5 (post-AUD-63), events-deep-link 5 (post-AUD-60, was 1), auth/account 3 (config states honest but AUD-85 copy), partner portal **2 — redesign candidate** (AUD-81).

## 8.5 Method deltas vs Round 1

320px added to the viewport matrix (repo QA matrix already listed it; now exercised); instrumented capture harness records per-shot HTTP status, h1 presence, `dir`, and horizontal overflow (60 captures, manifest in scratchpad); keyboard transcripts recorded stop-by-stop; native-language review flags (◇) resolved into concrete string fixes ×7 locales rather than left as annotations; every Round-1 fix attacked at its entry point (the §8.1 lesson).

## 8.6 Round-2 gate runs (post-fix, this branch)

```
npm run lint / typecheck              → clean
npm run test (vitest)                 → 786 passed (145 files; 3 suites updated to assert the new
                                        gated-trust behavior; +3 new tests pin the merge,
                                        ICS-newline, and drain-persist fixes)
npm run i18n:validate                 → 7 locales × 2338 keys
npm run i18n:scan -- --fail           → 0 hardcoded strings
npm run i18n:editorial-drift          → pass (fr/he/ro maps auto-synced)
npm run data:validate                 → OK
npm run check:conflict-markers        → OK
npm run build                         → exit 0
npm run test:e2e:gate:ci              → exit 0
  core-funnel 38 passed · ux 44 passed (1 recovered flaky, 1 skipped)
  visual-gate 17 passed · a11y (axe, 31 routes, contrast fatal) 1 passed
320px spot sweep (8 funnel routes, en+he+de) → 0px horizontal overflow

Batch 3 (third commit, full rerun): vitest 790 (4 new: trailId round-trip,
wineRoute guard ×3) · i18n 7×2348 · e2e gate 38+45+17+1 · 320px sweep 0px ·
live: laona/akamas counts 18/4 with localized metas, portal 503 shows honest
copy, booking API returns trailId, /el metas within limits.

Batch 4 (fourth commit, full rerun): vitest 790 · i18n 7×2364 · e2e gate
38+45+17+1 · 320px sweep 0px · live: Strategy-A canonical on /el detail with
full hreflang cluster, region ledes localized (el/de verified), Rundweg on
/de trail detail, hub filter chips measured shrinking wineries 44k→26k px /
villages 28k→10k / secrets 34k→12k with aria-live counts.

Backlog batch (follow-up commit, full rerun): lint · typecheck · vitest 786
(plan-items index regenerated for the `nameEl` carry-through) · i18n 7×2345 ·
data:validate · build · e2e gate 38+45+17+1 all passed (no flakes) · 320px
sweep 0px · live checks: single Home tab stop on every hub, deeper crumbs
keep non-duplicate items, `/el` plan renders Λεύκαρα / Μονοπάτι Αρτέμιδος,
plan cards 198px at 320 (was 182), booking "Add to calendar" present,
he_IL og:locale, article og:type, absolute winery JSON-LD image.
```
