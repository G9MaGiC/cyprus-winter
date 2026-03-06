# Cyprus Winter MVP — Polish Team

A team of subagents for polishing the Cyprus Winter MVP. Invoke each agent with the prompts below.

---

## Team Roster

| Role | Subagent Type | Focus |
|------|---------------|-------|
| **Code & architecture** | `senior-software-engineer` | Code quality, patterns, maintainability |
| **UX & design** | `generalPurpose` | UI polish, micro-interactions, accessibility |
| **Content & copy** | `generalPurpose` | Micro-copy, SEO, consistency |
| **Exploration & audit** | `explore` | Find gaps, broken patterns, missing pieces |
| **Performance & shell** | `shell` | Build, lint, test, perf checks |

---

## Invocation Prompts

### 1. Code & Architecture (senior-software-engineer)

```
Review the Cyprus Winter Next.js app for code quality and architecture. Focus on:
- Consistent patterns across pages (plan, discover, trails)
- Type safety and data model consistency
- Separation of concerns (data, UI, hooks)
- Any tech debt or refactoring opportunities
Produce a prioritized list of improvements with specific file references.
```

### 2. UX & Design Polish (generalPurpose)

```
Polish the Cyprus Winter app UX. Use the design system in .cursor/skills/cyprus-tourism-app/SKILL.md.
Audit: loading states, empty states, error states, focus/accessibility, touch targets (min 44px), 
mobile nav, card hover feedback, consistent spacing. Suggest concrete improvements with component paths.
```

### 3. Content & Copy (generalPurpose)

```
Audit content and copy across the Cyprus Winter app. Check:
- Consistent tone (friendly, informative, Mediterranean)
- Micro-copy clarity (CTAs, empty states, error messages)
- SEO: page titles, meta descriptions, heading hierarchy
- Factual accuracy for Cyprus (regions, distances, tips)
Reference: PRD.md for positioning, README for engagement tactics.
```

### 4. Exploration & Audit (explore)

```
Explore the cyprus-winter codebase. Find:
- Broken or inconsistent links
- Missing back navigation
- Unused or duplicate code
- Pages/components that don't follow the design system
- Gaps between PRD/README features and implementation
Return a structured report with file paths and line references.
```

### 5. Performance & Build (shell)

```
Run: npm run build, npm run lint. Check for:
- Build errors or warnings
- Lint violations
- Bundle size or slow route warnings
Fix any issues found.
```

---

## Polish Checklist (Pre-Launch)

Use this checklist when running the team:

- [x] **Code** — Senior engineer review complete; removeFromDay, getPlaceById, isWinery, RelatedPlacesBlock, formatReportedAgo, LAYOUT tokens
- [x] **UX** — Loading/empty/error states, accessibility (aria-*, skip link, role=alert), mobile (hero, mood pills, 44px touch targets), loading.tsx for key routes
- [x] **Content** — Copy audit, SEO (heading hierarchy), consistency; Wellness→Monasteries & culture; Governor's Beach chalk→white cliffs; winter-tips wired (airport, trails)
- [x] **Audit** — Trail URLs (id), related-places trail.id, gray→sand fallbacks, design system
- [x] **Build** — Clean build, no lint errors

---

## Running the Team

**Option A — Sequential:** Invoke agents one by one, apply fixes from each before the next.

**Option B — Parallel:** Invoke Code, UX, Content, and Explore in parallel; merge findings; prioritize and implement.

**Option C — Single orchestrator:** Ask the main agent to "run the polish team" and coordinate all subagents, then implement the highest-priority fixes.

---

## Latest Audit Results (from polish team run)

### High-priority fixes

| Source | Issue | File(s) |
|--------|-------|---------|
| Explore | Mountains → `/trails`, Wellness → `/discover?filter=monastery` | ✅ |
| Explore | Extract `statusBadge`, `difficultyBadge` to shared component | `trails/page.tsx`, `trails/[id]/page.tsx` |
| Senior eng | Extract `TrailBadges.tsx` | New `src/components/` |
| Senior eng | Centralize `allAttractions` in `src/data/` | New `src/data/index.ts` |
| UX | Add `error.tsx` and `not-found.tsx` | `src/app/` |
| UX | Add global `focus-visible` styles | `globals.css` |
| UX | Nav hamburger min 44px touch target | `Nav.tsx` |
| UX | Plan hydration flash — show loading until localStorage read | `plan/page.tsx` |

### Medium-priority

- Add `PageHeader` component ✅
- Add `loading.tsx` for discover, plan, trails ✅
- Replace hardcoded hex with Tailwind tokens ✅ (design-tokens.ts, viewport)
- Unify card hover to `hover:border-terracotta/30 hover:shadow-lg` ✅
- Extract `useItinerary` hook, `PlacePicker` components ✅
