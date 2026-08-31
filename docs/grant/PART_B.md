# Part B — Technical Annex (working draft)

**Call:** PRE-SEED/0526 · **Max funding:** €119,999 at 85% · **Duration:** 18 months  
**Host:** `[HOST ORGANISATION — legal name TBD]` · **Coordinator:** `[COORDINATOR NAME TBD]`  
**Status:** Working copy for paste into the **official template** (unmodified Part B form on IRIS). Page cap is **20**. This markdown is not the template.

This is not legal advice. Greek call text prevails.

---

## 1. Excellence (30%)

### 1.1 Objectives

Cyprus Winter is a **winter-first discovery, planning, and SME-booking product** for international short-haul visitors (UK, Germany, Poland, Israel, Greece). The 18-month project finishes an already-running prototype: partner-operated hours and tasting decisions, production hardening, international editorial, and measurable SME leads — not a second destination brochure.

**Success criteria (prototype + GTM):**

- 25 live winery partners and 15 guides sending or receiving tasting/tour requests
- Majority of saved Plans include ≥1 rural or mountain stop
- Public `GET /api/health` → `productionReady: true` on the production domain (Bearer dump of checks for the annex, no secrets)
- KPI export from `/api/stats` (funnel + SME lead fees + locale mix + rural/mountain vs beach Plan adds)

### 1.2 Innovation vs international state of the art

| Incumbent | What they do | Gap we exploit |
|-----------|--------------|----------------|
| **Visit Cyprus / DMO sites** | Official destination marketing, events, entry rules | Not a winter **operations** layer (open/closed, trail reports, village tasting requests) |
| **OTAs (Booking.com, GetYourGuide, Viator)** | Coastal inventory, summer density, commission lock-in | Weak Troodos/wine-village winter SKUs; SMEs default to WhatsApp |
| **Generic AI travel chat** | Unverified itineraries | We ground answers in curated `src/data`, trail reports, and `/skills` — refuse invented buses and festival dates |
| **Winery websites** | One cellar at a time | No cross-village Plan, no shared winter hours surface, no lead funnel the host can KPI |

The novelty is **winter decision support + SME request booking + grounded AI** on one funnel (Discover → Plan → Book), aimed at international locales, not “another Cyprus website.”

We will **not** add on-chain tourism, golf, weddings, or diving to chase Deputy Ministry keywords we do not serve.

### 1.3 SWOT

| | Helpful | Harmful |
|--|---------|---------|
| **Internal** | **S:** Working Plan→Book funnel, trail reports, winery/guide requests, HMAC booking lookup, 7 locales (beta `he`/`fr`/`ro` chrome+editorial+draft legal), cycling hub, operational wine-route hours, admin KPI export, thin `/partner` accept/decline. Hardening is verifiable in-repo: CI-gated WCAG 2.2 AA (structure + contrast fatal), nonce-based CSP, finite-state booking transitions with concurrency tests, and a four-suite E2E gate. **W:** Live `GET /api/health` on `cyprus-winter-three.vercel.app` still returns `productionReady: false` (Upstash/Supabase ops); partner overlay is in-memory; tasting-room photos still partner-gated; beta legal pages await **lawyer/translator sign-off** before graduating badge (`docs/BETA_LOCALE_GRADUATION.md`). |
| **External** | **O:** PRE-SEED international-startup window to 11 Sep 2026; Strategy 2035 year-round / accessibility / cycling; ReTour (CSTI/UNRF) as a later demonstrator. **T:** OTAs could add winter SKUs; DMO apps; evaluators reading us as a brochure; DNSH fail if we fake green numbers. |

### 1.4 Maturity (TRL)

The web app is a **system prototype in an operational environment** (public Next.js app, typed content in git, API bookings with optional Supabase). Treat as **TRL 6–7**. PRE-SEED funds completion (partner portal, GTM, market research), not a lab rewrite.

Risks: partners ignore hours updates; Hebrew/FR/RO legal drafts need a reviewer before dropping beta badges; Redis/Supabase misconfig fails closed in production. Mitigations: email-first partner loop already in data (`partnerEmail` on verified wineries); keep beta labels until legal review (`docs/BETA_LOCALE_GRADUATION.md`); health endpoint with annex-safe checks.

---

## 2. Added value and benefit (35%)

### 2.1 Demand and market

Winter visitors already fly LCA/PFO from UK, DE, PL, IL, GR and then meet **summer tooling**. Rural wineries and guides lose those days to WhatsApp and closed-door drives. We address a **specific need**: what is open, which trail is reported, how to request a tasting without an OTA.

Addressable wedge: independent winter short-breaks that include at least one wine village or Troodos trail. We do not claim to replace the entire Cyprus arrivals market.

**Willingness to pay (honest):** guests already submit tasting requests in the prototype (lead-fee metrics in admin stats when configured). SME willingness is the 18-month test (25 cellars), not a made-up TAM.

### 2.2 Impact

- **Economic:** winter leads for mountain/wine SMEs; host revenue via modest lead fees already modelled in data (`partnerLeadFeeEur`)
- **Social:** accessibility and family filters on Discover; 112 / travel-trust content; left-hand traffic honesty
- **Environmental:** season spread and skip-unsafe-trails (see `DNSH.md`) — **no kg CO₂ invention**
- **Jobs:** coordinator + product/engineering time in Cyprus; SME hours at cellars (not counted as our payroll)

### 2.3 Intellectual property

No patent is required for this software. IP is the **codebase, curated dataset, and brand**. Freedom to operate: original UI; Wikimedia CC heroes attributed in `docs/QA_BUGS.md`; do not scrape partner sites for photos. Compatibility: GDPR-style cookies, rate limits, admin HttpOnly session, no secrets in health JSON.

Trademarks/domain: `[IP COUNSEL TBD]`. Optional later: registered word mark. Not a patent race.

---

## 3. Implementation (35%)

### 3.1 Users and GTM

**Users:** Cultural explorers, active winter hikers, short-haul weekenders. Mobile-first (airport 4G).

**GTM (18 months):** UK/DE/PL content complete (tier-1 i18n PRs #186–#189); IL via Hebrew (draft legal pending lawyer review); partnerships with wine association for 5 pilot cellars; do not contradict Visit Cyprus entry/safety. Channels: SEO locales, partner tasting emails, cycling/wine fairs only if budgeted travel is in Part A.

### 3.2 Work packages

| WP | Months | Outcome | Already in prototype? |
|----|--------|---------|------------------------|
| WP1 Production gate | 0–3 | Upstash + Supabase; `productionReady: true`; Sentry | Public health captured **false** (`docs/grant/PRODUCTION_HEALTH.md`); secrets still ops |
| WP2 Partner portal | 0–6 | Hours, hero URL, accept/decline on existing bookings | Thin `/partner` MVP shipped; durable overlay + magic-link still post-award |
| WP3 International | 0–9 | `he`/`fr`/`ro` body; legal review | Beta chrome/editorial/legal drafts (PRs #179–#183); tier-1 de/el/pl complete (#186–#189); lawyer sign-off + graduate badge: `docs/BETA_LOCALE_GRADUATION.md` |
| WP4 Visible intelligence | 0–12 | Accessibility/cycling/wine-route/plan DNSH screenshots | Shipped (G3–G8) |
| WP5 Market + seed readiness | 12–18 | Research note, 25 SME leads, Seed-programme options | KPI CSV shipped (G9) including rural/mountain vs beach Plan mix |

### 3.3 Indicative budget (not Part A)

Aligned with €119,999 RIF / €21,177 host / €141,176 total (`COFINANCE.md`). Categories to enter **only** in IRIS Part A after advisor review: personnel, external (legal/i18n/grant, ≤50%), travel, overheads (≤20% of direct).

### 3.4 Team and partners

| Role | Person | Notes |
|------|--------|-------|
| Coordinator | `[COORDINATOR NAME TBD]` | CV in Annex I |
| Product / domain | `[NAME TBD]` | Cyprus winter / wine-village knowledge |
| Engineering | `[NAME TBD]` | Next.js, security, bookings API |
| Optional ≤20% partner | CSTI or UNRF **or none** | Experimental development / validation only |

No large enterprise without incentive-effect justification.

### 3.5 Risks and MVP

| Risk | Plan |
|------|------|
| IRIS eligibility fail | Advisor + RIF support **before** 4 Sep 2026 |
| Partners silent | Keep email requests; portal is additive |
| Ops secrets missing | Launch checklist; fail closed on rate limits |
| Evaluator reads “DMO clone” | Wireframes of Plan/Book/Ask AI, not only home |
| Pivot | Drop portal polish; keep funnel + hours emails |

Minimum viable funded increment: **productionReady + 5 pilot cellars using existing request flow**. Partner UI is the stretch.

### 3.6 DNSH

See `DNSH.md`. Compatible with season extension; no significant harm from this software project.

---

## Cite, do not rebuild

Plan → Book funnel, trail reports, winery/guide booking requests, HMAC lookup, grounded AI + `/skills`, offline Plan, travel-trust / 112, seven locales with beta labels, first-party funnel analytics, cycling hub, wine-route bookable stops, Discover practical filters, KPI export.

**Sources:** `GRANT_STRATEGY.md`, `GRANT_PITCH.md`, live app. **Call documents:** IRIS. **Contact:** callsupport@research.org.cy · 22 205000.
