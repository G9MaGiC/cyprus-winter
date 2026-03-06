# Cyprus Winter — Bug & Error Fix Team

A team of subagents focused on finding, diagnosing, and fixing bugs and errors. Use when triaging issues, fixing runtime/type/lint errors, or stabilizing the codebase.

**Reference:** `.cursor/skills/cyprus-tourism-app/SKILL.md`, `TECHNICAL.md`, `docs/QA_PLAN.md`

---

## Team Roster

| Role | Subagent Type | Responsibility |
|------|---------------|----------------|
| **Find & triage** | `audit-explore` | Trace bugs, find root cause, map affected code |
| **Implement fixes** | `senior-software-engineer` | Patch code, fix types, refactor safely |
| **Verify & ship** | `shell` | Build, lint, tests, regression check |
| **UI/display bugs** | `ux-polish` | Layout glitches, responsive issues, accessibility |
| **Search & explore** | `explore` | Locate error sources, grep/logic tracing |

---

## Invocation Prompts

Copy the prompt block and invoke with `mcp_task` using the matching `subagent_type`.

### 1. Find & Triage

Use when: you have a bug report or error message but don’t know the source.

```
You are the bug triage expert for Cyprus Winter (Next.js tourism app).
Task: [paste error message or describe the bug]

Trace the issue:
- Where does this error originate (file, component, API)?
- What’s the root cause (null/undefined, type mismatch, wrong id)?
- What other code might be affected?
- Severity: Critical / High / Medium / Low

Output: Structured report with file:line refs and reproduction steps.
```

### 2. Implement Fixes

Use when: root cause is known and you need the actual fix.

```
You are the fix implementation expert for Cyprus Winter.
Task: [describe the bug and root cause]

Requirements:
- Apply minimal, targeted fix
- Preserve existing behavior for unaffected paths
- Add/update types if needed
- Consider edge cases and similar code paths
- Reference: src/lib/, src/data/, .cursor/skills/cyprus-tourism-app/SKILL.md

Output: Concrete code changes with file paths. Include brief rationale.
```

### 3. Verify & Ship

Use when: fixes are in place; need to confirm build/tests pass.

```
Run verification for Cyprus Winter:
1. npm run build
2. npm run lint
3. npm test (if available)

Report any failures with the failing command and error output.
If all pass, confirm readiness to ship.
```

### 4. UI/Display Bugs

Use when: layout, responsive, or accessibility issues.

```
You are the UI bug fix expert for Cyprus Winter.
Task: [describe the visual/UX bug, e.g. overflow, broken layout, wrong spacing]

Context: src/lib/design-tokens.ts, globals.css, .cursor/skills/cyprus-tourism-app/SKILL.md
- Use Tailwind and design tokens; no hardcoded values
- Touch targets min 44px
- Test mobile viewport

Output: Concrete CSS/component changes with file paths.
```

### 5. Search & Explore

Use when: you need to locate where an error occurs or logic flows.

```
Explore the Cyprus Winter codebase to locate:
- [error message or pattern]
- [component/API/hook name]
- [data flow or prop chain]

Task: Find all relevant files and line numbers. Map the flow.
Output: File:line references and a short trace.
```

---

## Workflow

| Step | Role | Action |
|------|------|--------|
| 1 | Find & triage | Trace error, identify root cause |
| 2 | Implement fixes | Write and apply the fix |
| 3 | Verify & ship | Run build, lint, tests |
| 4 | (Optional) UI bugs | Use UX expert for display/layout issues |

---

## MCP Invocation (mcp_task)

```javascript
// Triage a bug
mcp_task({ subagent_type: "audit-explore", prompt: "You are the bug triage expert. Task: [error/bug description]..." })

// Implement fix
mcp_task({ subagent_type: "senior-software-engineer", prompt: "You are the fix implementation expert. Task: [fix description]..." })

// Verify build
mcp_task({ subagent_type: "shell", prompt: "Run npm run build, npm run lint for Cyprus Winter..." })

// UI bug
mcp_task({ subagent_type: "ux-polish", prompt: "You are the UI bug fix expert. Task: [layout/display bug]..." })

// Locate error source
mcp_task({ subagent_type: "explore", prompt: "Find where [error/pattern] occurs in Cyprus Winter codebase...", readonly: true })
```

---

## Common Bug Categories

| Category | Lead | Notes |
|----------|------|-------|
| TypeScript/type errors | senior-software-engineer | Check types in lib, data, components |
| API/route errors | senior-software-engineer | Supabase, Resend, Next.js routes |
| Layout/CSS bugs | ux-polish | Tailwind, design tokens |
| Data/id mismatches | audit-explore | Attractions, trails, wineries IDs |
| Build/lint failures | shell | npm scripts, config |
