**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Persona-led golden paths, amazement audit & backlog

**Version:** 1.0  
**Date:** May 2026  
**Sources:** [`docs/USER_ICPS.md`](USER_ICPS.md), [`docs/ICPS.md`](ICPS.md), [`.cursor/PRODUCT_DEEP.md`](../.cursor/PRODUCT_DEEP.md), [`docs/MESSAGING.md`](MESSAGING.md), codebase review  
**Leadership input:** Not captured in-repo for this exercise; **quarterly ICP priority below follows the executive table in [`docs/ICPS.md`](ICPS.md)** unless product leadership overrides.

---

## 1. Quarterly ICP priority (canonical from docs/ICPS.md)

| Rank | ICP | Priority tag | LTV | Revenue lens |
|------|-----|--------------|-----|----------------|
| 1 | Cultural Explorer Claire | **Primary** | €85 | Guided tours, wine, cultural bookings |
| 2 | Digital Nomad Nadia | **Growth** | €120 | Long-stay, referrals, repeat visits |
| 3 | Active Adventurer Anders | **Secondary** | €45 | Trail guides, transport |
| 4 | Winter Sun Family | **Emerging** | €60 | Family tours, seasonal repeat |

**Recommendation:** Ship roadmap slices in **Claire → Nadia → Anders → Family** order when choosing between pure persona bets; **Anders** stays high for engagement even at lower LTV (trail loop + reports).

Secondary ICPs from [`docs/USER_ICPS.md`](USER_ICPS.md) (Local, Expat, Bleisure) are **advocacy / fill-in traffic**—track via events, secrets, airport, plan share, not primary conversion targets unless campaigns demand it.

---

## 2. Amazement rubric

Per critical step: score **Relief** (0–2), **Specificity** (0–2), **Payoff** (0–2). **Total ≤ 3** ⇒ redesign candidate.

---

## 3. Golden paths (codebase-informed walkthrough)

Screenshots were not attached in this automated audit; routes and UI references are verifiable in-repo.

### 3.1 Claire — Cultural Explorer

**Path:** Home → Discover → place detail → Add to plan → Plan (templates, days) → Share → optional book tasting.

| Step | Route / surface | R | S | P | Notes |
|------|-----------------|---|---|---|--------|
| Inspire | `/` — `messages/en.json` `ui.app__home_HomeHero` | 2 | 2 | 2 | Aligns with MESSAGING “Sixteen degrees…”, winter positioning. |
| Curate | `/discover`, `/discover/[id]` — related / pair well | 2 | 2 | 2 | Strong: curated data + `RelatedPlacesBlock` pattern. |
| Plan arc | `/plan` — `QuickStartSection`, `ITINERARY_TEMPLATES`, `PlanShareBar` | 2 | 2 | 1 | **Payoff risk:** share is functional (`PlanShareBar` + `ShareLinks`) but not yet “presentation / social card” level. |
| Book | `/book/winery/[id]` | 2 | 2 | 2 | End-to-end booking + local storage; e2e covered. |
| **Total signal** | | | | | **Claire path is the strongest in-app story; biggest gap is “wow” on share/export narrative.**

### 3.2 Anders — Active Adventurer

**Path:** `/trails` → `/trails/[id]` → conditions section → `/trails/[id]/report`.

| Step | Route / surface | R | S | P | Notes |
|------|-----------------|---|---|---|--------|
| Orientation | `/trails` — `TrailStatusGroup`, `trailConditions` | 2 | 2 | 2 | “Check before you go” supported by static + grouped UI. |
| Trust | `/trails/[id]` — “Latest from hikers” vs static conditions (`SectionCard`) | 2 | 2 | 2 | **Update (shipped):** list `TrailsClient` “Community intel” strip; detail copy when static snapshot + no DB report (honest CTA to “Share what you saw”). When `getLatestReportsByTrail` returns data, payoff remains highest. |
| Contribute | `/trails/[id]/report` | 2 | 2 | 2 | Clear civic framing (“Help others”). |
| **Total signal** | | | | | **Conditions amazement = f(report volume).** Surface messaging on list pages for “no recent reports” could lift Relief when DB is sparse. |

### 3.3 Nadia — Digital Nomad

**Path:** `/search` → `/plan` → AI assistant suggestions.

| Step | Route / surface | R | S | P | Notes |
|------|-----------------|---|---|---|--------|
| Speed | `/search` | 2 | 2 | 1 | Scannable; “tool not magazine” depends on result quality and density. |
| Plan | `/plan` — quick start, sticky add | 2 | 2 | 2 | Good efficiency signals. |
| AI | `src/components/AIAssistant.tsx` — `SUGGESTIONS_HOME` / `SUGGESTIONS_PLAN` | 2 | 2 | 1 | Suggestions include “Short stay: 48 hours”, “Work from 16°C” *not explicit* in chips—**nomad hook underrepresented vs MESSAGING lines.** Payoff depends on API grounding (PRODUCT_DEEP). |
| **Total signal** | | | | | Strong mechanics; **explicit nomad / efficiency hooks** in AI chips optional enhancement. |

### 3.4 Winter Sun Family

**Path:** Discover filters → family-friendly detail → Plan → Bookings.

| Step | Route / surface | R | S | P | Notes |
|------|-----------------|---|---|---|--------|
| Discover | `/discover` filters | 2 | 2 | 1 | **Update (shipped):** “Family-friendly” chip → `?filter=family` (maps to Hidden gems section + sticky title “Family-friendly”). Hero/family-specific line still optional. |
| AI | `SUGGESTIONS_DISCOVER` includes “Family-friendly places in winter” | 2 | 2 | 2 | Good alignment with USER_ICPS Family hook. |
| Reassurance | `/bookings` | 2 | 2 | 2 | Explainer + sync by email reduces parental anxiety (recent UX copy). |
| **Total signal** | | | | | Discover filter entry improved; optional **home** family strip or hero line remains a polish bet. |

### 3.5 Bleisure / arrival

**Path:** `/airport` → `/plan?template=short-stay`.

| Step | Route / surface | R | S | P | Notes |
|------|-----------------|---|---|---|--------|
| Arrival | `/airport` — hero “Just landed?”, first hour, essentials | 2 | 2 | 2 | Matches MESSAGING Bleisure: “Just landed?” + practical numbers. |
| Time-box | Link `href="/plan?template=short-stay"` “Plan your first 48 hours” | 2 | 2 | 2 | Aligns with MESSAGING “48-hour itinerary” segment lines. |
| **Total signal** | | | | | **Strong persona fit on paper.** Depth of template `short-stay` content determines whether payoff feels “one screen” vs many taps. |

### 3.6 Local / Expat (secondary)

**Path:** `/events` → `/secrets` → Plan share.

| Step | Route / surface | R | S | P | Notes |
|------|-----------------|---|---|---|--------|
| Rediscover | `/events` — seasonal calendar framing | 2 | 2 | 1 | Payoff tied to **fresh events data** and filters (validate CMS/data pipeline). |
| Insider | `/secrets` | 2 | 2 | 2 | Fits “beyond tourist” positioning. |
| Host | Plan share link | 2 | 1 | 2 | Share mechanics exist; **preview OG title** for recipients affects advocacy. |

---

## 4. Ranked gap backlog (P0–P2)

| ID | Status | Priority | Persona | Gap | Route / owner |
|----|--------|----------|---------|-----|----------------|
| G1 | Open | **P0** | Claire | Plan share / export lacks “story-grade” preview (OG, title, one-line trip summary for recipients). | `/plan`, `PlanShareBar`, metadata |
| G2 | **Shipped** | ~~P0~~ | Anders | Conditions UX when no recent reports: list + detail messaging + report CTA (see §3.2). | `/trails`, `/trails/[id]` |
| G3 | **Shipped** | ~~P1~~ | Family | Discover family entry: `Family-friendly` chip + title (Hidden gems data). | `/discover` |
| G4 | **Shipped** | ~~P1~~ | Nadia | Nomad hook on AI home chip (“Work from 16°C…”). | `AIAssistant.tsx` |
| G5 | Open | **P1** | Bleisure | Validate `short-stay` template density end-to-end; may need fewer clicks from `/airport` CTA to filled Plan. | `/plan`, `ITINERARY_TEMPLATES` |
| G6 | Open | **P2** | Local | Events index freshness perception (seasonal copy, “updated” cues). | `/events` |
| G7 | **Shipped** | ~~P2~~ | All | `USER_ICPS.md` Anders priority aligned to executive `ICPS.md` (Secondary). | Docs |

---

## 5. Messaging alignment (MESSAGING.md ↔ product UI)

| Segment | Hook in [`docs/MESSAGING.md`](MESSAGING.md) | Product reflection | Match |
|---------|---------------------------------------------|---------------------|-------|
| Cultural Explorer | Real places. Real winters. No tourist traps. | Hero subtitle / meta “real”, onboarding “Plan as you go” | Partial — **explicit “no tourist traps” line absent from hero JSON**; tone implied. |
| Active Adventurer | Troodos trails. Winter sun. Check conditions before you go. | Trails meta + trail detail conditions | Strong |
| Digital Nomad | Work from 16°C. Weekend trails, villages, heritage. | Home/meta “sixteen degrees”; AI home chip “Work from 16°C—weekend trails near Limassol” | Stronger |
| Winter Sun Family | Mild weather. Beaches, ruins, markets. Family-friendly Cyprus. | AI Discover suggestion + **Discover `?filter=family`** chip | Partial — **hero not family-specific** |
| Bleisure | Just arrived? One trail. One village. One evening. | Airport hero + 48h plan CTA | Strong |
| Local | Your island in winter. Fewer crowds. Same light. | Secrets/events framing | Partial |

**Concrete UI strings audited:** [`messages/en.json`](../messages/en.json) — `onboarding.*`, `meta.homeDescription`, `ui.app__home_HomeHero.*`, `events.*`.

---

## 6. Experiments (thin; measurable)

| Experiment | Hypothesis | Ship surface | Primary metric | Guardrail |
|------------|------------|--------------|----------------|-----------|
| **E1 — Claire share preview** | Richer share title/summary increases opens of shared plan links. | `plan_share` payload + OG/meta for shared routes | `plan_share` events → inferred outbound clicks if tracked; proxy: **copy_link** / share taps (↑) | Booking_cancel unchanged |
| **E2 — Anders freshness cue** | Trail cards showing “Last report X ago” (or “No reports yet”) increase report submissions. | `/trails` cards | `trail_report_submitted` (↑); time on trail detail | Bounce rate stable |
| **E3 — Bleisure one-glance** | Airport hero A/B: add bullet “Tonight · Tomorrow · Wine” deep links vs control increases `/plan?template=short-stay` loads within session. | `/airport` | `template=short-stay` navigation rate; `first_add_to_plan` within 10 min | Support clicks unchanged |

Instrumentation hooks already exist for several (`track("first_add_to_plan")`, etc.); extend [`src/lib/analytics`](../src/lib/analytics.ts) / funnel if missing for E1/E2.

---

## 7. Next actions

1. Review **G1** in sprint planning (Claire share preview); G2–G4/G7 closed in-repo as above.
2. Align **docs/ICPS.md** vs **USER_ICPS.md** Anders priority with product once per quarter (currently aligned).
3. Optional: add **`docs/PERSONA_WOW_AUDIT.md` screenshots appendix** after manual QA pass (`docs/QA_PLAN.md` phases).
