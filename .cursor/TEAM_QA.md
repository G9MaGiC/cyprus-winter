# Cyprus Winter — QA Team

Best team for quality assurance and a repeatable process to improve with every QA cycle.

**Reference:** `docs/QA_PLAN.md`, `docs/UX_UI_RESPONSIVE_MATRIX.md`, `.cursor/TEAM_REVIEW.md`, `.cursor/TEAM_VISUAL_QA.md`, `.cursor/TEAM_BUGFIX.md`, `.cursor/MCP_TASK_CONFIG.md`

---

## Team Roster

| Layer | Subagent | Focus |
|-------|----------|-------|
| **Automated** | `shell` | lint, test, build — run first |
| **Gaps & Security** | `audit-explore` | PRD drift, broken links, security, consistency |
| **Code & Architecture** | `senior-software-engineer` | Patterns, types, API correctness |
| **Visual & Design** | `branding-redesign`, `ux-polish` | Design system, tokens, cross-page consistency |
| **Content & SEO** | `content-polish` | Copy, meta, heading hierarchy |
| **Discovery** | `explore` | Thorough search, outliers (optional) |
| **Verify** | `shell` | Re-run build/lint after fixes |

**Note:** Use `subagent_type: "TEAM-AGENTS"` for audit-explore, branding-redesign, ux-polish, content-polish, senior-software-engineer. Specify the agent in the prompt. Use `shell` and `explore` directly.

---

## Invocation Prompts

### 1. Automated (shell)

```
Run for Cyprus Winter:
1. npm run lint
2. npm run test
3. npm run build

Report results. Fix any failures.
```

### 2. Audit (audit-explore)

```
You are the audit-explore subagent. QA audit for Cyprus Winter.

Task: Find gaps, broken links, PRD drift, security risks, inconsistencies.
Reference: docs/QA_PLAN.md, PRD.md, README

Output: Structured report — Category → Issue → File:Line → Severity (P0/P1/P2).
```

### 3. Code & Architecture (senior-software-engineer)

```
You are the senior-software-engineer subagent. QA code review for Cyprus Winter.

Task: Review patterns, types, API correctness, security (XSS, rate limits), error handling.
Reference: .cursor/skills/cyprus-tourism-app/SKILL.md, TECHNICAL.md

Output: Prioritized findings with file paths and line references.
```

### 4. Visual QA (branding-redesign + ux-polish)

```
You are the branding-redesign subagent. Visual QA for Cyprus Winter.

Task: Run the anomaly checklist from .cursor/TEAM_VISUAL_QA.md.
Check: colors, typography, components, design tokens.
Output: List of anomalies with file:line, current value, suggested fix.
```

```
You are the ux-polish subagent. Visual QA for Cyprus Winter.

Task: Run the anomaly checklist from .cursor/TEAM_VISUAL_QA.md.
Check: layout, spacing, touch targets, loading/empty/error states.
Output: List of anomalies with file:line and severity (P0–P2).
```

### 5. Content (content-polish)

```
You are the content-polish subagent. QA content audit for Cyprus Winter.

Task: Check copy, tone, SEO (meta, headings), micro-copy consistency.
Reference: PRD.md, .cursor/skills/cyprus-tourism-app/SKILL.md

Output: Findings with file paths and suggested improvements.
```

---

## Iterative Improvement Process

1. **Run QA** — Shell (lint/test/build) then parallel: audit-explore, senior-software-engineer, ux-polish, branding-redesign, content-polish. Merge findings into one prioritized list.
2. **Log** — Add to `docs/QA_BUGS.md` or GitHub Issues (template in docs/QA_PLAN.md §5). Record baseline metrics.
3. **Fix** — Use TEAM_BUGFIX: audit-explore (triage) → senior-software-engineer/ux-polish (fix) → shell (verify).
4. **Re-run** — lint, test, build; smoke test key flows (docs/QA_PLAN.md §2.3).
5. **Compare** — Ensure no regressions; verify findings decreased.
6. **Update** — Add recurring issues to TEAM_VISUAL_QA, QA_PLAN risk areas, or team runbooks so future runs catch them earlier.

---

## How to Run

**Full QA (pre-launch):** Invoke shell first, then Code + UX + Content + Audit + Visual (branding + ux) in parallel. Merge findings, prioritize, fix, re-run.

**Quick QA:** shell + audit-explore.

**Visual-only:** Run TEAM_VISUAL_QA (branding-redesign, ux-polish, explore).

---

## MCP Examples

```javascript
// Automated
mcp_task({ subagent_type: "shell", prompt: "Run npm run lint, npm run test, npm run build for Cyprus Winter. Fix any failures." })

// Audit
mcp_task({ subagent_type: "TEAM-AGENTS", prompt: "You are the audit-explore subagent. QA audit for Cyprus Winter. Find gaps, broken links, PRD drift. Reference docs/QA_PLAN.md. Output: Category → Issue → File:Line → Severity." })

// Visual QA
mcp_task({ subagent_type: "TEAM-AGENTS", prompt: "You are the audit-explore subagent. Visual QA for Cyprus Winter. Run anomaly checklist from .cursor/TEAM_VISUAL_QA.md. Report by category with file:line and severity." })
```
