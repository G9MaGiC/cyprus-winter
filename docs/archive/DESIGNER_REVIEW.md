**Status**: Archived (historical).

**Canonical docs**: see docs/README.md and the specific canon for this topic.

---

# Website Designer Review Process

**Owner:** Website Designer / Head of Design  
**Purpose:** Ensure design system consistency, visual hierarchy, and Mediterranean brand application across all sections  
**Frequency:** Pre-launch, after design system changes, quarterly  
**Status:** Launched (Mar 2026)  
**Ref:** `.cursor/skills/cyprus-tourism-app/SKILL.md`, `src/lib/design-tokens.ts`, `globals.css`, PRD Winter Visual Identity

---

## Launch

**First run:** [DESIGNER_REVIEW_2026-03-05.md](./DESIGNER_REVIEW_2026-03-05.md)  
- All 15 pages reviewed against design system  
- Visual QA fixes applied (P0–P2)  
- Mediterranean identity consistent

---

## 1. Review Scope

### Pages to Audit

| Route | Page | Design Focus |
|-------|------|--------------|
| `/` | Home | Hero, sections, mood pills, card grid |
| `/discover` | Discover list | FilterChips, card grid, callout boxes |
| `/discover/[id]` | Attraction/winery detail | Image, hierarchy, badges, CTAs |
| `/trails` | Trails list | Cards, badges, conditions display |
| `/trails/[id]` | Trail detail | Layout, callouts, waypoints |
| `/trails/[id]/report` | Report form | Form layout, buttons |
| `/events` | Winter events | Cards, event layout |
| `/plan` | Itinerary builder | Day tabs, PlacePicker, templates |
| `/book/winery/[id]` | Winery booking | Form layout, branding |
| `/bookings` | My bookings | Cards, status badges, empty state |
| `/airport` | Arriving | Sections, transport cards |
| `/team` | Team | Profile cards, CTAs |
| `/account` | Account | Callout, CTAs |
| Error / Not-found | Error pages | Layout, recovery UI |

---

## 2. Checklist by Dimension

### A. Design System — Colors

| # | Question | Pass / Fail | Notes |
|---|----------|-------------|-------|
| A1 | Terracotta used for primary CTAs only? | | |
| A2 | Olive for text, charcoal for headings? | | |
| A3 | Golden for accent (golden hour, highlight)? | | |
| A4 | Aegean for links (not terracotta)? | | |
| A5 | No hardcoded hex; all tokens from theme? | | |
| A6 | Sand/limestone for backgrounds? | | |

### B. Design System — Typography

| # | Question | Pass / Fail | Notes |
|---|----------|-------------|-------|
| B1 | Headings use `font-display` (Fraunces)? | | |
| B2 | Body uses default `font-sans` (Plus Jakarta Sans)? | | |
| B3 | H1/H2/H3 hierarchy consistent per section type? | | |
| B4 | Muted text uses olive/70, olive/80, olive/90? | | |

### C. Design System — Layout & Spacing

| # | Question | Pass / Fail | Notes |
|---|----------|-------------|-------|
| C1 | Page wrapper uses LAYOUT tokens (list, detail, form)? | | |
| C2 | Page padding consistent (px-6 py-12 or responsive)? | | |
| C3 | Section spacing consistent (py-12, mb-6/8/10)? | | |
| C4 | Card padding aligned (p-4 compact, p-5/p-6 content)? | | |

### D. Component Patterns

| # | Question | Pass / Fail | Notes |
|---|----------|-------------|-------|
| D1 | Cards: rounded-2xl, border-sand-200, hover-terracotta? | | |
| D2 | Primary CTA: bg-terracotta rounded-xl or rounded-lg min-h-44px? (Chip-style: rounded-full) | | |
| D3 | Badges: px-2.5 py-1 rounded-full bg-sand-100? | | |
| D4 | Callout boxes: bg-olive/5 or bg-golden/5, border-olive/10? | | |
| D5 | FilterChips active: terracotta with ring? | | |

### E. Responsive & Mobile

| # | Question | Pass / Fail | Notes |
|---|----------|-------------|-------|
| E1 | Layout works at 375px viewport? | | |
| E2 | Touch targets min 44px? | | |
| E3 | Horizontal scroll areas use scrollbar-none where needed? | | |
| E4 | Grid collapses appropriately (1-col mobile, 2–4 col desktop)? | | |

### F. Brand & Visual Identity

| # | Question | Pass / Fail | Notes |
|---|----------|-------------|-------|
| F1 | Mediterranean warmth felt (terracotta, golden, olive)? | | |
| F2 | Winter identity clear (no summer imagery/messaging conflict)? | | |
| F3 | Images use consistent aspect ratios (4:3, aspect-video)? | | |
| F4 | No off-brand elements? | | |
| F5 | Imagery audit: Cyprus-specific, winter-appropriate? (Avoid generic/ summer scenes.) | | |

### G. Accessibility (Design)

| # | Question | Pass / Fail | Notes |
|---|----------|-------------|-------|
| G1 | Focus-visible styles present? | | |
| G2 | Color contrast meets WCAG AA? | | |
| G3 | Interactive elements have sufficient touch area? | | |

---

## 3. Page-by-Page Review Template

```markdown
## Page: [Route] — [Page name]
**Reviewed:** [Date]  
**Reviewer:** [Name]

### A. Colors
### B. Typography
### C. Layout & Spacing
### D. Components
### E. Responsive
### F. Brand
### G. Accessibility

### Issues (Prioritized)
1. [P0/P1/P2] — [issue] — [action]

### Sign-off
☐ Design approved
☐ Needs revision
```

---

## 4. Process Steps

### Step 1: Kickoff

- [ ] Schedule review
- [ ] Ensure design system docs are current (SKILL, design-tokens)
- [ ] View on staging or local (desktop + mobile)

### Step 2: Systematic Audit

- [ ] Work through pages in scope
- [ ] Run each through sections A–G
- [ ] Capture screenshots for key screens

### Step 3: Prioritization

- [ ] **P0:** Blocker (brand violation, broken layout, accessibility fail)
- [ ] **P1:** Should fix (inconsistent pattern, spacing drift)
- [ ] **P2:** Polish (minor alignment, typography tweak)

### Step 4: Remediation

- [ ] Log issues; assign to design/eng
- [ ] Re-review after fixes

### Step 5: Sign-off

- [ ] Designer sign-off documented

---

## 5. Quick Audit (30-Minute Pass)

| Page | Colors | Typography | Components | Responsive | Brand |
|------|--------|------------|------------|------------|-------|
| Home | ☐ | ☐ | ☐ | ☐ | ☐ |
| Discover | ☐ | ☐ | ☐ | ☐ | ☐ |
| Discover detail | ☐ | ☐ | ☐ | ☐ | ☐ |
| Trails | ☐ | ☐ | ☐ | ☐ | ☐ |
| Plan | ☐ | ☐ | ☐ | ☐ | ☐ |
| Bookings | ☐ | ☐ | ☐ | ☐ | ☐ |
| Airport | ☐ | ☐ | ☐ | ☐ | ☐ |
| Team | ☐ | ☐ | ☐ | ☐ | ☐ |
| Error / Not-found | ☐ | ☐ | ☐ | ☐ | ☐ |

---

## 6. Outputs

- **Review log:** `docs/DESIGNER_REVIEW_[YYYY-MM-DD].md`
- **Backlog:** Issues with `designer-review` label
- **ROADMAP:** Design polish items

---

## 7. References

- **.cursor/skills/cyprus-tourism-app/SKILL.md** — Design system, colors, typography, patterns
- **src/lib/design-tokens.ts** — LAYOUT, TOKENS
- **src/app/globals.css** — Theme, focus styles
- **.cursor/TEAM_VISUAL_QA.md** — Visual anomaly audit (run in parallel)
