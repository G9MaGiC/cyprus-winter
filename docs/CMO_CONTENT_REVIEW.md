# CMO Content & Conversion Review Process

**Owner:** Chief Marketing Officer  
**Purpose:** Ensure every section and page supports positioning, conversion, and brand consistency  
**Frequency:** Pre-launch, quarterly, and before major campaigns  
**Status:** Launched (Mar 2026)  
**Ref:** PRD.md (personas, positioning), README.md (engagement tactics), ROADMAP.md

---

## Launch

**First run:** [CMO_REVIEW_2026-03-04.md](./CMO_REVIEW_2026-03-04.md)  
- All 15 pages reviewed; no blockers  
- P2 fixes applied (Discover title, Team CTAs)  
- Ready for launch

---

## 1. Review Scope

### Pages to Audit

| Route | Page | Primary Role |
|-------|------|--------------|
| `/` | Home | Conversion entry, value prop, hero CTAs |
| `/discover` | Discover list | Category discovery, filter UX |
| `/discover/[id]` | Attraction/winery detail | Trust, booking entry, related CTAs |
| `/trails` | Trails list | Trail conditions, filter UX |
| `/trails/[id]` | Trail detail | Conditions, safety, add-to-plan |
| `/trails/[id]/report` | Report conditions | Engagement, UGC |
| `/events` | Winter events | Seasonal relevance, dates |
| `/plan` | Itinerary builder | Core engagement, templates, book CTA |
| `/book/winery/[id]` | Winery booking form | Revenue conversion |
| `/bookings` | My bookings | Retention, sync, book-more |
| `/airport` | Arriving | First-touch, transport, tips |
| `/team` | Team | Trust, credibility |
| `/account` | Account | Placeholder, sign-in funnel |
| Error / Not-found | Error pages | Trust, recovery path |

---

## 2. Checklist by Dimension

### A. Positioning & Messaging

**Questions for each page:**

| # | Question | Pass / Fail | Notes |
|---|----------|-------------|-------|
| A1 | Does the page support "Escape the Cold" / Mediterranean winter positioning? | | |
| A2 | Is the tone warm, practical, and Mediterranean—no hype or generic travel fluff? | | |
| A3 | Are winter-specific benefits clear (mild temps, fewer crowds, golden hour, cozy tastings)? | | |
| A4 | Does copy avoid summer-centric language where inappropriate? | | |

**Target personas by page:**

- **Home:** Claire (culture), Anders (trails), Nadia (flexibility)
- **Discover:** Claire, Nadia
- **Trails:** Anders, Claire
- **Plan:** All three
- **Bookings / Winery:** Claire, Nadia
- **Airport:** All (first touch)

### B. Conversion & Funnel

**Questions for each page:**

| # | Question | Pass / Fail | Notes |
|---|----------|-------------|-------|
| B1 | Is there a clear primary CTA? | | |
| B2 | Does the CTA point toward Plan or Book (core funnel)? | | |
| B3 | Are secondary CTAs visible but not competing? | | |
| B4 | Does Discover → Plan path feel obvious? | | |
| B5 | Does Plan surface "Book tasting" for wineries? | | |
| B6 | Is AI Assistant surfaced for discovery/planning friction? | | |

**Funnel map (verify):**

```
Home → [Discover | Trails | Plan | Airport]
Discover → [Detail] → Add to Plan | Book (if winery)
Trails → [Detail] → Add to Plan | Report conditions
Plan → Add places | Copy itinerary | Book tasting
Bookings → Book more | Load by email
```

### C. SEO & Metadata

**Questions for each page:**

| # | Question | Pass / Fail | Notes |
|---|----------|-------------|-------|
| C1 | Title is descriptive and includes Cyprus / winter where relevant? | | |
| C2 | Meta description is 150–160 chars, actionable, winter-focused? | | |
| C3 | H1 hierarchy is logical (one H1 per page)? | | |
| C4 | Keywords align with PRD target markets (UK, Poland, Germany, etc.)? | | |

### D. Trust & Credibility

**Questions for each page:**

| # | Question | Pass / Fail | Notes |
|---|----------|-------------|-------|
| D1 | Emergency 112 / 1460 / 199 present on key pages (home, error, not-found)? | | |
| D2 | Insider tips and local knowledge feel authentic? | | |
| D3 | Team / expertise referenced where it builds trust? | | |
| D4 | Verified / partner badges visible for wineries? | | |
| D5 | No unsubstantiated claims? | | |

### E. Content Quality

**Questions for each page:**

| # | Question | Pass / Fail | Notes |
|---|----------|-------------|-------|
| E1 | Copy is factual for Cyprus (regions, distances, opening norms)? | | |
| E2 | Dates and events are accurate for current winter season? | | |
| E3 | No typos, inconsistent terminology, or broken links? | | |
| E4 | Empty states and errors have helpful, on-brand copy? | | |

### F. Engagement Tactics (README)

**Questions for each page:**

| # | Question | Pass / Fail | Notes |
|---|----------|-------------|-------|
| F1 | Hook Model: clear trigger, low-friction action, variable reward? | | |
| F2 | CTAs are rounded-full, high-contrast, 44px touch target? | | |
| F3 | "Add to plan" / "Continue planning" visible where relevant? | | |
| F4 | Winter-specific tips (daylight, layers, book-ahead) surfaced? | | |

---

## 3. Page-by-Page Review Template

Use one sheet per page. Copy for each route.

```markdown
## Page: [Route] — [Page name]
**Reviewed:** [Date]  
**Reviewer:** [Name]

### A. Positioning & Messaging
- A1: ☐ Pass ☐ Fail — [notes]
- A2: ☐ Pass ☐ Fail — [notes]
- A3: ☐ Pass ☐ Fail — [notes]
- A4: ☐ Pass ☐ Fail — [notes]

### B. Conversion & Funnel
- B1–B6: [notes]

### C. SEO & Metadata
- C1–C4: [notes]

### D. Trust & Credibility
- D1–D5: [notes]

### E. Content Quality
- E1–E4: [notes]

### F. Engagement Tactics
- F1–F4: [notes]

### Issues (Prioritized)
1. [P0/P1/P2] — [issue] — [action]
2. ...

### Sign-off
☐ Ready for launch / campaign
☐ Needs revision
```

---

## 4. Process Steps

### Step 1: Kickoff

- [ ] Schedule review window (recommend 2–3 days)
- [ ] Assign reviewer(s) — CMO or delegate
- [ ] Pull latest from main; ensure staging reflects prod
- [ ] Review PRD personas and positioning before starting

### Step 2: Systematic Audit

- [ ] Work through pages in funnel order: Home → Discover → Trails → Plan → Book → Bookings → Airport → Team → Account
- [ ] Run each page through sections A–F
- [ ] Capture screenshots for before/after
- [ ] Note device context (mobile vs desktop) where relevant

### Step 3: Prioritization

- [ ] **P0:** Blocker (wrong positioning, broken conversion, legal/trust issue)
- [ ] **P1:** Should fix before launch (weak CTAs, SEO gaps, tone drift)
- [ ] **P2:** Nice to have (micro-copy, secondary links)

### Step 4: Remediation

- [ ] Create tickets for P0 and P1
- [ ] Assign owners (content, design, product)
- [ ] Set deadline before launch or campaign
- [ ] Re-run review on updated pages

### Step 5: Sign-off

- [ ] All P0 resolved
- [ ] P1 triaged (fix or accept risk)
- [ ] CMO sign-off documented

---

## 5. Quick Audit (30-Minute Pass)

When time is limited, run this short check:

| Page | Positioning | Primary CTA | SEO | Trust |
|------|-------------|-------------|-----|-------|
| Home | ☐ | ☐ | ☐ | ☐ |
| Discover | ☐ | ☐ | ☐ | ☐ |
| Discover detail | ☐ | ☐ | ☐ | ☐ |
| Trails | ☐ | ☐ | ☐ | ☐ |
| Trails detail | ☐ | ☐ | ☐ | ☐ |
| Plan | ☐ | ☐ | ☐ | ☐ |
| Winery booking | ☐ | ☐ | ☐ | ☐ |
| Bookings | ☐ | ☐ | ☐ | ☐ |
| Airport | ☐ | ☐ | ☐ | ☐ |
| Error / Not-found | ☐ | ☐ | ☐ | ☐ |

---

## 6. Outputs

- **Review log:** `docs/CMO_REVIEW_[YYYY-MM-DD].md` (or similar)
- **Backlog:** Issues logged in project tracker with `cmo-review` label
- **ROADMAP update:** Content/marketing actions added to ROADMAP.md where appropriate

---

## 7. References

- **PRD.md** — Personas (Claire, Anders, Nadia), positioning, winter taxonomy
- **README.md** — UX tactics, Hook Model, engagement patterns
- **ROADMAP.md** — Launch timeline, campaign prep, content audit
- **.cursor/TEAM_VISUAL_QA.md** — Visual consistency (complementary to this process)
