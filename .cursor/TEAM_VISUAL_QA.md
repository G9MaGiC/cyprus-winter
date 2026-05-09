# Cyprus Winter — Visual QA Team

A focused team for finding **all visual anomalies** across the app. Use when auditing design consistency, pre-release polish, or after major UI changes.

**Reference:** `src/lib/design-tokens.ts`, `src/app/globals.css`, `.cursor/skills/cyprus-tourism-app/SKILL.md`

---

## Team Roster

| Role | Subagent | Focus |
|------|----------|-------|
| **Design system** | `branding-redesign` | Colors, typography, tokens, component patterns |
| **UI consistency** | `ux-polish` | Spacing, layout, touch targets, states |
| **Discovery** | `explore` | Cross-page patterns, missed files, outliers |

---

## Visual Anomaly Checklist

Use this checklist when running the team. Agents should report findings against these categories:

### Colors
- [ ] Hardcoded hex instead of Tailwind tokens
- [ ] Inconsistent accent (terracotta vs olive vs golden for same purpose)
- [ ] Border/background mismatches (e.g. `border-golden/20` vs `border-olive/10` for similar callouts)
- [ ] Emergency/info text formatting (112, 1460, 199) consistent across pages

### Typography
- [ ] Headings missing `font-display`
- [ ] Inconsistent heading sizes (h1, h2, h3) for same hierarchy level
- [ ] Body text opacity (`text-olive/70` vs `text-olive/80` vs `text-olive/90`)

### Layout & Spacing
- [ ] LAYOUT width inconsistency (list vs listNarrow) without clear reason
- [ ] Page padding mismatch (`px-6 py-12` vs `px-4 sm:px-6 py-8 sm:py-12`)
- [ ] Section spacing drift (`mb-6` vs `mb-8` vs `mb-10`)
- [ ] Card padding inconsistent (`p-4` vs `p-5` vs `p-6`)

### Components
- [ ] Card borders (`border-sand-200` vs `border-olive/10`)
- [ ] Card hover states (`hover:border-terracotta/30` vs `hover:border-golden/50`)
- [ ] CTA styles (primary vs secondary inconsistent)
- [ ] Badge/chip styles (FilterChips, status badges, type badges)
- [ ] Tip/insight boxes (`bg-golden/5` vs `bg-olive/5`)

### States & Feedback
- [ ] Loading skeletons vs page layout mismatch
- [ ] Empty states visual style
- [ ] Error/not-found pages vs design system
- [ ] Touch targets under 44px

### Cross-Page
- [ ] Footer/hero emergency line consistency
- [ ] PageHeader back link presence
- [ ] Nav active state styling

### Responsive & viewports (all pages)

Use **`docs/UX_UI_RESPONSIVE_MATRIX.md`** as the master checklist. At minimum:

- [ ] **320px, 375px, 768px, 1024px, 1280px** — no horizontal overflow; hero and CTAs usable
- [ ] **Bottom nav clearance** on mobile — primary content and sticky bars above `BOTTOM_NAV` clearance (`design-tokens.ts`)
- [ ] **Safe areas** — notched devices: nav + bottom padding respect `env(safe-area-inset-*)`
- [ ] **Locale** (`/el`, `/de`, …) — longer strings do not break chips, cards, or nav

---

## Invocation Prompts

### 1. Design System (branding-redesign)

```
You are auditing Cyprus Winter for VISUAL ANOMALIES only. No rebrand—just consistency.

Context: src/lib/design-tokens.ts, globals.css, .cursor/skills/cyprus-tourism-app/SKILL.md

Task: Find all design-token and component-pattern inconsistencies.

Check:
- Colors: terracotta (CTAs), olive (text), golden (accent), sand (background), aegean (links)
- No hardcoded hex; all Tailwind classes use theme tokens
- Card patterns: rounded-2xl border border-sand-200 hover:border-terracotta/30
- Tip/callout boxes: bg-olive/5 border-olive/10 vs bg-golden/5 border-golden/20
- Badge/chip active states (FilterChips, status badges)

Output: List of anomalies with file:line, current value, suggested fix. Group by category.
```

### 2. UI Consistency (ux-polish)

```
You are auditing Cyprus Winter for VISUAL ANOMALIES only.

Context: .cursor/skills/cyprus-tourism-app/SKILL.md, LAYOUT tokens

Task: Find spacing, layout, and feedback inconsistencies across pages.

Check:
- Page wrapper: px-6 py-12 vs px-4 sm:px-6 py-8 sm:py-12
- LAYOUT.list vs LAYOUT.listNarrow usage (Discover, Trails, Plan)
- Section spacing (mb-6, mb-8, mb-10, py-12)
- Card padding (p-4, p-5, p-6)
- Emergency/info text: "Emergency 112 · Tourist info 1460 · Ambulance 199" format
- Error/not-found page alignment with design system
- Touch targets (min-h-[44px]) on interactive elements

Output: List of anomalies with file:line and suggested fix. Prioritize P0–P2.
```

### 3. Discovery (explore)

```
Explore the Cyprus Winter codebase for visual inconsistency.

Find ALL pages and components that render UI:
- src/app/**/page.tsx
- src/app/**/error.tsx, not-found.tsx, loading.tsx
- src/components/*.tsx

Check for:
- Pages missing LAYOUT or using different layout patterns
- Tip/callout boxes with different bg/border styles
- Filter chips or badges with different active styles
- Emergency 112/1460/199 formatting variations
- Any className patterns that deviate from the design system

Target: thoroughness. Return structured report with file paths and specific lines.
```

---

## How to Run

**Parallel (recommended):** Invoke all three agents at once, then merge findings.

```
Run the Visual QA team: invoke branding-redesign, ux-polish, and explore with the prompts in .cursor/TEAM_VISUAL_QA.md. Merge findings into a single prioritized list of visual anomalies.
```

**Sequential:** Run Design system → UI consistency → Discovery; apply fixes between runs if desired.

**Single pass:** Ask the main agent to "run the Visual QA team and fix all anomalies."

---

## Output Format

Each finding should include:
- **Category:** Colors | Typography | Layout | Components | States | Cross-page
- **Severity:** P0 (breaks consistency) | P1 (noticeable) | P2 (minor)
- **File:Line**
- **Current**
- **Suggested**
