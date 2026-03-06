# Cyprus Winter — Review & Improve Team

A team of AI subagents that review the project end-to-end and clean or improve everything. Use this as the master runbook.

---

## Team Roster

| Role | Subagent Type | Responsibility |
|------|---------------|----------------|
| **Code & architecture** | `senior-software-engineer` | Patterns, types, tech debt, refactors |
| **UX & design** | `ux-polish` | Flows, accessibility, mobile, micro-interactions |
| **Content & copy** | `content-polish` | Tone, SEO, micro-copy, factual accuracy |
| **Branding & visual** | `branding-redesign` | Design system, tokens, component consistency |
| **Exploration & audit** | `audit-explore` | Gaps, broken links, PRD drift, inconsistencies |
| **Build & perf** | `shell` | Build, lint, tests, bundle size |

---

## Invocation Prompts

Copy the prompt block and invoke with `mcp_task` using the matching `subagent_type`.

### 1. Code & Architecture

```
Review the Cyprus Winter Next.js app for code quality and architecture. Focus on:
- Consistent patterns across pages (plan, discover, trails, bookings)
- Type safety and data model consistency
- Separation of concerns (data, UI, hooks, lib)
- Tech debt and refactoring opportunities
- Unused code, duplicate logic, missing abstractions
Produce a prioritized list of improvements with specific file paths and line references.
If you find quick wins, apply them. Otherwise report for the main agent to implement.
```

### 2. UX & Design

```
Review and improve the Cyprus Winter app UX. Reference: .cursor/skills/cyprus-tourism-app/SKILL.md
Audit:
- User flows (discovery → plan → book)
- Loading, empty, and error states
- Accessibility (aria-*, labels, focus, skip link)
- Touch targets (min 44px)
- Mobile nav and responsive behavior
- Card/button hover feedback and spacing
Suggest concrete improvements with component paths. Apply quick wins if trivial.
```

### 3. Content & Copy

```
Audit content and copy across the Cyprus Winter app. Check:
- Consistent tone (friendly, informative, Mediterranean)
- Micro-copy clarity (CTAs, empty states, error messages)
- SEO: page titles, meta descriptions, heading hierarchy
- Factual accuracy for Cyprus (regions, distances, tips, geology)
- References: PRD.md, README, docs/TRACTION.md
List improvements with file paths. Apply minor copy fixes if safe.
```

### 4. Branding & Visual

```
Review the Cyprus Winter design system and visual consistency:
- Color palette (terracotta, olive, golden, aegean, sand) usage
- Typography (font-display, font-sans)
- Component patterns (cards, CTAs, badges) across pages
- LAYOUT and design tokens from src/lib/design-tokens.ts
- Mediterranean brand feel
List inconsistencies with file references. Suggest top 3–5 polish items.
```

### 5. Exploration & Audit

```
Explore the cyprus-winter codebase. Find:
- Broken or inconsistent links
- Missing back navigation
- Unused or duplicate code
- Pages/components not following the design system
- Gaps between PRD/README features and implementation
- Security or data flow concerns
Return a structured report: Category → Issue → File:Line → Severity.
```

### 6. Build & Performance

```
Run: npm run build, npm run lint
Check for: build errors, lint violations, slow route warnings, bundle size issues.
Fix any issues found. Report anything that requires manual intervention.
```

---

## How to Run the Team

**Option A — Full review (recommended first run)**  
Invoke Code, UX, Content, Audit in parallel. Merge findings, prioritize, then implement.

**Option B — Sequential**  
Invoke one agent at a time. Apply fixes before the next. Good for focused passes.

**Option C — Single orchestrator**  
Ask the main agent: “Run the Review & Improve team per TEAM_REVIEW.md” — it will coordinate subagents and implement fixes.

---

## MCP Task Examples

```javascript
// Code review
mcp_task({
  subagent_type: "senior-software-engineer",
  prompt: "Review the Cyprus Winter Next.js app for code quality...",
  description: "Code & architecture review"
})

// UX review
mcp_task({
  subagent_type: "ux-polish",
  prompt: "Review and improve the Cyprus Winter app UX...",
  description: "UX & design review"
})

// Content review
mcp_task({
  subagent_type: "content-polish",
  prompt: "Audit content and copy across the Cyprus Winter app...",
  description: "Content & copy review"
})

// Audit
mcp_task({
  subagent_type: "audit-explore",
  prompt: "Explore the cyprus-winter codebase. Find broken links...",
  description: "Exploration & audit"
})

// Build check
mcp_task({
  subagent_type: "shell",
  prompt: "Run npm run build, npm run lint. Fix any issues.",
  description: "Build & lint"
})
```

---

## Output Convention

Each subagent should return:
1. **Findings** — Prioritized list (P0/P1/P2 or Critical/High/Medium/Low)
2. **File references** — Path and optional line numbers
3. **Recommendations** — Concrete changes
4. **Applied** — What was fixed directly vs. left for main agent
