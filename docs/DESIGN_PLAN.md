# Cyprus Winter — Design Plan: Page by Page, Flow by Flow

**Version:** 1.0  
**Last updated:** March 2026  
**Teams:** TEAM_DESIGN (branding-redesign, ux-polish, audit-explore)

A structured plan to design the Cyprus Winter project systematically. Run each phase in order; each produces design recommendations and implementation tasks.

---

## Overview

| Phase | Scope | Team | Order |
|-------|-------|------|-------|
| **0** | Design system | branding-redesign | First |
| **1** | Core pages (Home, Discover, Trails) | branding-redesign + ux-polish | After 0 |
| **2** | Conversion flows (Plan, Book, Bookings) | ux-polish | After 1 |
| **3** | Supporting pages (Events, Search, Secrets, Airport, Team) | ux-polish + branding-redesign | After 2 |
| **4** | Cross-cutting (Nav, AI, mobile, a11y) | ux-polish | After 3 |
| **5** | Visual QA pass | audit-explore / ux-polish | Last |

**Reference:** `.cursor/TEAM_DESIGN.md`, `docs/USER_FLOWS_AZ.md`

---

## Phase 0: Design System Foundation

**Goal:** Ensure tokens, typography, and base components are consistent before page work.

| Task | Files | Team | Prompt focus |
|------|-------|------|--------------|
| 0.1 Token audit | globals.css, design-tokens.ts, SKILL.md | branding-redesign | Colors, spacing, typography scale |
| 0.2 Component audit | AttractionCard, TrailCard, buttons, badges, filters | branding-redesign | Patterns, hover, borders, no hardcoded hex |
| 0.3 Update SKILL | .cursor/skills/cyprus-tourism-app/SKILL.md | branding-redesign | Token table, component checklist |

**Invocation:**
```
You are James Okonkwo and Kostas. Audit the Cyprus Winter design system. Tokens, components, globals.css. No hardcoded hex. Reference: SKILL.md.
```

---

## Phase 1: Core Pages (Page by Page)

### 1.1 Homepage (`/`)

| Item | File | Design focus |
|------|------|--------------|
| Hero | page.tsx | CTA hierarchy, imagery, mobile layout |
| Editor's picks (4 places) | page.tsx | Card grid, spacing, alt text |
| Browse by category | page.tsx | Filter chips, links |
| Quick start | page.tsx | Card layout, CTAs |
| Local secrets preview | page.tsx | Card style, "See all" |
| Plan + Events | page.tsx | Card balance, CTAs |
| Essentials | page.tsx | Link list, visual weight |

**Flow to verify:** Hero → Discover / Trails / Secrets / Plan / Airport; Browse → /discover?filter=X; Quick start → specific routes.

**Invocation:**
```
Design review for Homepage (src/app/page.tsx). Visual hierarchy, hero CTAs, card grids, mobile 375px, states.
```

---

### 1.2 Discover list (`/discover`)

| Item | File | Design focus |
|------|------|--------------|
| Page header | discover/page.tsx | h1, back, filters |
| Filter chips | discover/page.tsx | Region, type, difficulty — visual feedback |
| Card grid | discover/page.tsx | AttractionCard consistency, add-to-plan |
| Empty state | discover/page.tsx | No results messaging |

**Flow to verify:** Filter → filtered list; Card tap → /discover/[id]; Add to itinerary → /plan?add=[id].

**Invocation:**
```
Design review for Discover list (src/app/discover/page.tsx). Filters, card grid, empty state, mobile.
```

---

### 1.3 Discover detail (`/discover/[id]`)

| Item | File | Design focus |
|------|------|--------------|
| Hero image | discover/[id]/page.tsx | Aspect ratio, alt |
| Content block | discover/[id]/page.tsx | Typography, spacing |
| Related places | discover/[id]/page.tsx | Card layout, "Add +" |
| Book tasting (winery) | discover/[id]/page.tsx | CTA prominence |
| Add to itinerary | discover/[id]/page.tsx | Button state ("In itinerary") |

**Flow to verify:** Book tasting → /book/winery/[id]; Related → /discover/X or /trails/X; Add + → /plan?add=X.

**Invocation:**
```
Design review for Discover detail (src/app/discover/[id]/page.tsx). Hero, content, related block, CTAs, states.
```

---

### 1.4 Trails list (`/trails`)

| Item | File | Design focus |
|------|------|--------------|
| Page header | trails/page.tsx | h1, conditions CTA |
| Filters | trails/page.tsx | Difficulty, region chips |
| Best right now | trails/page.tsx | Featured cards |
| Map | trails/page.tsx | Markers, legend |
| Trail cards | trails/page.tsx | TrailCard, badges, alt |
| Report conditions | trails/page.tsx | Footer CTA |

**Flow to verify:** Filter → list; Card → /trails/[id]; Report → /trails/[id]/report.

**Invocation:**
```
Design review for Trails list (src/app/trails/page.tsx). Filters, map, cards, report CTA, mobile.
```

---

### 1.5 Trail detail (`/trails/[id]`)

| Item | File | Design focus |
|------|------|--------------|
| Hero | trails/[id]/page.tsx | Image, difficulty badge |
| Description | trails/[id]/page.tsx | Typography |
| Conditions block | trails/[id]/page.tsx | Status, surface, last reported |
| Related places | trails/[id]/page.tsx | Add +, links |
| Report conditions | trails/[id]/page.tsx | CTA to report page |

**Flow to verify:** Report conditions → /trails/[id]/report; Related Add + → /plan?add=X.

**Invocation:**
```
Design review for Trail detail (src/app/trails/[id]/page.tsx). Hero, conditions, related block, CTAs.
```

---

### 1.6 Trail report (`/trails/[id]/report`)

| Item | File | Design focus |
|------|------|--------------|
| Form layout | trails/[id]/report/page.tsx | Labels, inputs, validation |
| Success state | trails/[id]/report/page.tsx | Confirmation, link back |

**Flow to verify:** Submit → API → success state.

**Invocation:**
```
Design review for Trail report form (src/app/trails/[id]/report/page.tsx). Form UX, validation, success state.
```

---

## Phase 2: Conversion Flows (Flow by Flow)

### 2.1 Plan flow (Add → Build → Copy)

| Step | From | To | Design focus |
|------|------|-----|--------------|
| Entry | Discover/Trails detail | /plan?add=[id] | Add to itinerary button clarity |
| Day tabs | Plan page | Switch active day | Tab styling, active state |
| Add to day | Plan page | PlacePicker, suggested | Visual feedback when added |
| Remove | Plan card | Remove from day | Clear affordance |
| Copy | Plan page | Clipboard | CTA, confirmation |

**Files:** plan/page.tsx, AddToItineraryButton, RelatedPlacesBlock, SuggestedForDay

**Invocation:**
```
UX review of Plan flow: Add to itinerary → Plan → Day tabs → Add/remove → Copy. Friction points, feedback, mobile.
```

---

### 2.2 Book winery flow

| Step | From | To | Design focus |
|------|------|-----|--------------|
| Entry | Discover winery detail | /book/winery/[id] | Book tasting CTA |
| Form | Book page | Submit | Labels, validation, error states |
| Success | API | Success view | Confirmation, next steps |

**Files:** book/winery/[id]/page.tsx, WineryBookingForm

**Invocation:**
```
UX review of Book winery flow. Form layout, validation, success state, error handling.
```

---

### 2.3 Bookings flow

| Step | From | To | Design focus |
|------|------|-----|--------------|
| Load | Email input | API merge | Form, loading state |
| List | Bookings | Cards | Card layout, View winery link |
| Empty | No bookings | Empty state | CTA to discover wineries |

**Files:** bookings/page.tsx

**Invocation:**
```
UX review of Bookings flow. Load by email, list display, empty state, CTAs.
```

---

## Phase 3: Supporting Pages (Page by Page)

### 3.1 Events (`/events`)

| Item | Design focus |
|------|--------------|
| Header, filters | Region, type |
| Event cards | Layout, date badge, "Learn more" |
| Highlight events | Prominence |
| Empty state | No events messaging |

**Invocation:** `Design review for Events (src/app/events/). Filters, cards, highlights.`

---

### 3.2 Search (`/search`)

| Item | Design focus |
|------|--------------|
| Search input | Prominence, placeholder |
| Results dropdown | List layout, type badges |
| Empty / no results | Messaging |
| Mobile | Full-page vs dropdown behavior |

**Invocation:** `Design review for Search (src/app/search/). Input, results, empty state, mobile.`

---

### 3.3 Secrets (`/secrets`)

| Item | Design focus |
|------|--------------|
| Card layout | Secret cards, "Go there" |
| Visual style | Distinct from Discover cards |

**Invocation:** `Design review for Secrets (src/app/secrets/). Card layout, CTAs.`

---

### 3.4 Airport (`/airport`)

| Item | Design focus |
|------|--------------|
| Content structure | Sections, headings |
| Emergency / practical | 112, 1460, 199 visibility |
| CTAs | Links to Discover, Trails |

**Invocation:** `Design review for Airport (src/app/airport/). Content hierarchy, emergency line, CTAs.`

---

### 3.5 Team (`/team`)

| Item | Design focus |
|------|--------------|
| Profile cards | Image, name, bio |
| Layout | Grid, spacing |

**Invocation:** `Design review for Team (src/app/team/). Profile cards, layout.`

---

### 3.6 Account (`/account`)

| Item | Design focus |
|------|--------------|
| Sign-in (if any) | Form layout |
| Placeholder state | Clear next steps |

**Invocation:** `Design review for Account (src/app/account/). Form, states.`

---

## Phase 4: Cross-Cutting (Flow by Flow)

### 4.1 Navigation flow

| Item | Design focus |
|------|--------------|
| Desktop nav | Links, active state, More menu |
| Mobile bottom nav | Icons, active state |
| Search icon | Opens /search or inline |
| Ask AI | Prominence, placement |

**Files:** Nav.tsx, layout.tsx

**Invocation:** `UX review of navigation. Desktop nav, mobile bottom nav, active states, AI trigger.`

---

### 4.2 AI Assistant flow

| Item | Design focus |
|------|--------------|
| Trigger | Button placement, visibility |
| Panel | Open/close, overlay |
| Messages | Bubble style, readability |
| Loading | Typing indicator |
| Error | Friendly message |

**Files:** AIAssistant.tsx, AIAssistantTrigger.tsx

**Invocation:** `Design review for AI Assistant. Trigger, panel, messages, loading, error states.`

---

### 4.3 Mobile & accessibility

| Item | Design focus |
|------|--------------|
| Touch targets | Min 44px |
| Scroll | Sticky header, scroll-to-top |
| Keyboard | Focus order, skip link |
| Screen reader | Semantic HTML, ARIA |
| Contrast | WCAG AA |

**Invocation:** `UX review for mobile and accessibility. Touch targets, keyboard, contrast, semantic HTML.`

---

## Phase 5: Visual QA Pass

**Goal:** Full consistency check across the app.

| Category | Checklist items |
|----------|-----------------|
| Colors | No hardcoded hex, consistent accents |
| Typography | h1/h2/h3 hierarchy, body opacity |
| Layout | Section spacing, card padding, LAYOUT widths |
| Components | Card borders, hover states, CTAs, badges |
| States | Loading, empty, error consistency |
| Cross-page | Footer, nav active, emergency line |

**Invocation:**
```
Visual QA for Cyprus Winter. Run anomaly checklist from TEAM_VISUAL_QA.md. Report by category with file:line.
```

---

## Execution Order

```
Phase 0 (Design system)
    ↓
Phase 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 (Core pages)
    ↓
Phase 2.1 → 2.2 → 2.3 (Conversion flows)
    ↓
Phase 3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 (Supporting pages)
    ↓
Phase 4.1 → 4.2 → 4.3 (Cross-cutting)
    ↓
Phase 5 (Visual QA)
```

---

## MCP Quick Reference

```javascript
// Phase 0
mcp_task({ subagent_type: "TEAM-AGENTS", prompt: "You are the branding-redesign subagent. Audit Cyprus Winter design system. Tokens, components, globals.css. Reference SKILL.md." })

// Phase 1 (example: Homepage)
mcp_task({ subagent_type: "TEAM-AGENTS", prompt: "You are the ux-polish subagent. Design review for Homepage (src/app/page.tsx). Hero, cards, mobile, states." })

// Phase 2 (example: Plan flow)
mcp_task({ subagent_type: "TEAM-AGENTS", prompt: "You are the ux-polish subagent. UX review of Plan flow. Add to itinerary → Plan → Day tabs → Copy. Friction, feedback." })

// Phase 5
mcp_task({ subagent_type: "TEAM-AGENTS", prompt: "You are the audit-explore subagent. Visual QA for Cyprus Winter. Run TEAM_VISUAL_QA checklist. Report by category." })
```

---

## Page & Flow Index

| Page | Route | Phase |
|------|-------|-------|
| Home | `/` | 1.1 |
| Discover list | `/discover` | 1.2 |
| Discover detail | `/discover/[id]` | 1.3 |
| Trails list | `/trails` | 1.4 |
| Trail detail | `/trails/[id]` | 1.5 |
| Trail report | `/trails/[id]/report` | 1.6 |
| Plan | `/plan` | 2.1 |
| Book winery | `/book/winery/[id]` | 2.2 |
| Bookings | `/bookings` | 2.3 |
| Events | `/events` | 3.1 |
| Search | `/search` | 3.2 |
| Secrets | `/secrets` | 3.3 |
| Airport | `/airport` | 3.4 |
| Team | `/team` | 3.5 |
| Account | `/account` | 3.6 |

| Flow | Phase |
|------|-------|
| Design system | 0 |
| Hero → main CTAs | 1.1 |
| Discover list → detail → add to plan | 1.2, 1.3 |
| Trails list → detail → report | 1.4, 1.5, 1.6 |
| Add to itinerary → Plan → Copy | 2.1 |
| Book tasting flow | 2.2 |
| Bookings load → list | 2.3 |
| Navigation (desktop + mobile) | 4.1 |
| AI Assistant | 4.2 |
| Mobile & accessibility | 4.3 |
| Visual QA | 5 |
