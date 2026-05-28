# Cyprus Winter — Full-stack QA personas (Winter 2026)

**Status:** Living document  
**Owner:** QA / Product  
**Last updated:** May 2026  
**Purpose:** Picky, market-grounded personas that critique the **entire product** (not only UI).  
**Related:** `docs/QA_MARKET_CONTEXT_WINTER_2026.md`, `docs/QA_PERSONA_JOURNEYS_2026.md`, `docs/QA_PERSONA_PRIORITIES_2026.md`, `.cursor/PRODUCT_DEEP.md`, `.cursor/UX_PERSONA.md`

---

## How to use this doc

1. Pick **2–3 personas per release** and run scripted journeys in `docs/QA_PERSONA_JOURNEYS_2026.md`.
2. For each finding, log in `docs/QA_BUGS.md` with persona ID (e.g. `PERSONA-PL-01`).
3. **Full-stack** = each persona scores: **market fit, trust, discover, plan, book, i18n, mobile, a11y, SEO/share, ops**.

**Brand lens (all personas):** Cyprus Winter = *premium, quiet, discovery-first* (see `.cursor/UX_PERSONA.md`). No FOMO, no emoji brand voice.

---

## Persona index

| ID | Name | Market | Archetype |
|----|------|--------|-----------|
| UK-01 | Margaret & David | UK | Skeptical sun seekers |
| PL-01 | Kasia & Tomasz | Poland | Value architects |
| IL-01 | Yael & Omri | Israel | Tel Aviv weekenders |
| GR-01 | Nikos | Greece | Cynical weekender |
| DE-01 | Stefan & Lena | Germany | Standards hikers |
| DE-02 | Anna | Germany | Berlin remote + weekends |
| NORD-01 | Oskar & Ingrid | SE/NO/DK | Light chasers |
| RO-01 | Andrei & Elena | Romania | First-timers |
| UK-02 | James | UK | Half-term dad |
| A11Y-01 | Priya | UK (audit) | Accessibility auditor |
| PERF-01 | Marcus | — | Performance skeptic |
| B2B-01 | Elena V. | Cyprus | Winery partner |
| LB-01 | Rina | Lebanon | Diaspora |
| FR-01 | Claire | France | Slow traveler |
| US-01 | Sam | US/CA | Long-haul experimental |
| CRISIS-01 | Composite | Multi | March 2026 reconsideration |

---

## UK-01 — Margaret & David (“Skeptical Sun Seekers”)

**Demographics:** 60s, retired or semi-retired, UK, 10–14 nights, Paphos/Limassol apartment, rental car.

**Winter motivation:** Mild escape; avoid UK winter; light sightseeing; one Troodos day; winery lunch; low walking.

**Devices:** iPad + iPhone; large text; bright screen outdoors.

### Full-stack critique

| Layer | Score (1–5) | Harsh feedback |
|-------|-------------|----------------|
| Market fit | 4 | Feels aimed at active hikers more than “gentle pace.” |
| Trust | 3 | Wants EHIC/GHIC pointer, pharmacy, **112**, driving reminder on plan days. |
| Discover | 4 | Curated lists good; wants **accessible / low walking** filter. |
| Plan | 3 | Templates exist but no **“relaxed pace”** or one-region-per-day guard. |
| Book | 2 | “Request booking” scary — needs SLA, phone, cancellation. |
| i18n | 5 | English fine. |
| Mobile | 4 | Bottom nav OK; sticky bars historically risky (retest each release). |
| A11y | 3 | Hero contrast, small footer links. |
| SEO | N/A | Finds via Google “Cyprus winter seniors.” |

**1-star review they’d write:** *“Pretty site, but I still don’t know if the winery actually confirmed our tasting.”*

**Better:** Relaxed template; accessibility tags; booking status page; practical strip on plan.

---

## PL-01 — Kasia & Tomasz (“Polish Value Architects”)

**Demographics:** 30s–40s, family with kids + grandparent, 7 nights, Larnaca, rent-a-car.

**Winter motivation:** Sun value vs Poland winter; charter mindset; **Polish language**.

### Full-stack critique

| Layer | Score | Harsh feedback |
|-------|-------|----------------|
| Market fit | 4 | Family filter helps; missing **total cost** hints. |
| Trust | 3 | Wants clear **winter opening** on every card. |
| Discover | 4 | `pl` locale — will hunt untranslated strings. |
| Plan | 2 | Can stack impossible days; no **drive time**. |
| Book | 3 | Party size validation improved; wants **price from €X**. |
| i18n | 4 | pl good; search needs **Polish spellings** (Limassol/Lemesos). |
| Mobile | 4 | Filter drawer on sm — must be 44px+. |

**1-star review:** *“Po polsku jest OK, ale plan na jeden dzień to Omodos + Troodos + plaża? Serio?”*

**Better:** Drive-time between stops; family template v2; PL SEO pages; winery price hints.

---

## IL-01 — Yael & Omri (“Tel Aviv Weekenders”)

**Demographics:** 30s, couple, 3–4 nights, high spend, food + wine + short trail.

**Winter motivation:** Quick escape; **security news** heavily influences go/cancel in 2026.

### Full-stack critique

| Layer | Score | Harsh feedback |
|-------|-------|----------------|
| Market fit | 4 | Short-trip AI prompts would help. |
| Trust | 2 | No **factual travel context**; tone can feel tone-deaf in crisis weeks. |
| Discover | 4 | Quality curation. |
| Plan | 4 | Fast add from discover (`?add=` must not break book navigation). |
| Book | 3 | Email-only; wants **WhatsApp/call** on winery. |
| i18n | 2 | No Hebrew. |
| Mobile | 5 | Fast funnel. |

**Better:** Critical-path HE or superb EN; gov links module; instant confirmation UX.

---

## GR-01 — Nikos (“Cynical Athenian”)

**Demographics:** 30s–50s, frequent, Greek-first.

**Winter motivation:** Weekends; family; “I know Cyprus.”

### Full-stack critique

| Layer | Score | Harsh feedback |
|-------|-------|----------------|
| Market fit | 3 | Too “foreign brochure.” |
| Trust | 4 | Buffer zone notes appreciated if accurate. |
| Discover | 3 | Same “greatest hits.” |
| Plan | 4 | Locale on `/el/plan` must hold (regression test). |
| i18n | 4 | el good; wants more **Greek titles** on cards. |

**Better:** “Local winter” editorial; Nicosia food/events; Greek metadata.

---

## DE-01 — Stefan & Lena (“German Standards Couple”)

**Demographics:** 40s, hikers + wine, 8 nights.

**Winter motivation:** Troodos conditions; precision; **Datenschutz**.

### Full-stack critique

| Layer | Score | Harsh feedback |
|-------|-------|----------------|
| Trail | 4 | Reports good; wants **official vs community** badge. |
| Map | 3 | Will test scroll trap on trail detail map (`MapInteractionGuard`). |
| Plan | 3 | No GPX/ICS export. |
| Book | 4 | de locale on forms. |
| Legal | 3 | GDPR story scattered across privacy + cookie. |

**Better:** Conditions trust layer; export plan; bus winter realism on car-free days.

---

## DE-02 — Anna (“Berlin Remote + Weekends”)

**Demographics:** 28–38, workation 3 weeks, Limassol.

**Critique:** No nomad filter (wifi, quiet café); Plan ignores **work hours**; wants month weather tied to trip dates.

**Better:** Workation template; restaurant depth; evening discover lane.

---

## NORD-01 — Oskar & Ingrid (“Light Chasers”)

**Critique:** No sunrise/sunset on plan days; sand UI low contrast in grey weather; English-only OK but SEO loss.

**Better:** Daylight per day; photo-spot tags in data; contrast audit outdoors.

---

## RO-01 — Andrei & Elena (“Romanian First-Timers”)

**Critique:** No RO locale; wants package-style **day combos** with total duration; trust badges on wineries.

**Better:** First-visit path; amplify `day-combos` in UI; lightweight social proof.

---

## UK-02 — James (“Half-Term Dad”)

**Critique:** AI too prominent for kids context; trails lack **age suitability**; family sticky/footer clearance on 320px.

**Better:** Family mode; rain-day indoor block; trail family tags in data.

---

## A11Y-01 — Priya (“Accessibility Auditor”)

**Critique:** Chip scroll focus; modal focus trap; map keyboard; booking error association.

**Better:** WCAG 2.2 AA pass on discover filters, plan modals, map overlays; published a11y statement.

---

## PERF-01 — Marcus (“Performance Skeptic”)

**Critique:** Hero `priority` on all hubs; heavy map JS; plan hydration flash; no offline plan read.

**Better:** LCP budgets per hub; lazy maps; read-only offline plan.

---

## B2B-01 — Elena V. (“Winery Partner”, Krasochoria)

**Critique:** Opaque leads; stale hours in `src/data/wineries.ts`; no partner dashboard.

**Better:** Lead email clarity; admin stats export; winter hours SLA in data pipeline.

---

## LB-01 — Rina (“Lebanese Diaspora”)

**Critique:** Generic Mediterranean party tone; wants family villages, religious sites, **respectful** copy on sensitive areas.

**Better:** Diaspora editorial lane; avoid hype during regional tension.

---

## FR-01 — Claire (“French Slow Traveler”)

**Critique:** No `fr` locale; wants wine education depth (AOP-style); unrealistic public transport hints.

**Better:** FR roadmap or EN “slow travel” path; honest car-hire messaging.

---

## US-01 — Sam (“Long-Haul Experimental”)

**Critique:** Missing intl driving license tips, tipping, winter sun myths; expects Facetime-friendly booking comms.

**Better:** Long-haul primer on airport page; realistic expectations in hero copy.

---

## CRISIS-01 — “March 2026 Reconsideration Guest” (composite)

**Profile:** Booked Jan/Feb; regional news in Mar; questions travel.

**Critique:** App still **cheerful** without **flexibility / official guidance** links; pushes Book during alerts.

**Better:** Calm travel status module (link out to gov sources); empathetic copy; soften conversion CTAs during alerts.

---

## Cross-persona release checklist

- [ ] Winter truth on every detail (hours, conditions, appointments)
- [ ] Plan locale preserved on all `?add=` flows (`usePlanUrlActions` / i18n router)
- [ ] Booking: translated errors + post-submit clarity
- [ ] Hero: nav clearance (`LAYOUT.heroContentTop`), contrast, no double `safeAreaX` on discover search
- [ ] Maps: `MapInteractionGuard` on Discover, Trails, Plan, Wine routes
- [ ] No hardcoded EN in funnel (`npm run i18n:scan --fail`)
- [ ] Geopolitical sensitivity review on home + book during crisis weeks

---

*Extend with new personas when CySTAT releases shift the arrivals mix.*
