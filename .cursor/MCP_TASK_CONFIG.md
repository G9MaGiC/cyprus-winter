# mcp_task Configuration — Cyprus Winter

**Purpose:** Map design and team subagents to the working `mcp_task` invocation pattern.

## Subagent Type Limitation

`mcp_task` only accepts these `subagent_type` values:

- `generalPurpose` — General tasks
- `explore` — Codebase search and exploration
- `shell` — Shell commands
- **`TEAM-AGENTS`** — Routes to project subagents in `.cursor/agents/`

The design subagent names (`branding-redesign`, `ux-polish`, `audit-explore`) are **not** direct enum values. Use `TEAM-AGENTS` and specify the agent in the prompt.

---

## Working Invocations

### Design System (James + Kostas)

```javascript
mcp_task({
  subagent_type: "TEAM-AGENTS",
  description: "Design system audit",
  prompt: "You are the branding-redesign subagent (James Okonkwo and Kostas Papadopoulos). Audit the Cyprus Winter design system. Tokens, components, globals.css. Reference .cursor/skills/cyprus-tourism-app/SKILL.md."
})
```

### Page Design (Lena)

```javascript
mcp_task({
  subagent_type: "TEAM-AGENTS",
  description: "Homepage design review",
  prompt: "You are the ux-polish subagent (Lena Müller). Design review for Homepage (src/app/page.tsx). Visual hierarchy, mobile 375px, loading/empty/error states."
})
```

### Visual QA (Audit)

```javascript
mcp_task({
  subagent_type: "TEAM-AGENTS",
  description: "Visual QA pass",
  prompt: "You are the audit-explore subagent. Visual QA for Cyprus Winter. Run the anomaly checklist from .cursor/TEAM_VISUAL_QA.md. Report by category with file:line and severity."
})
```

---

## Agent Names (use in prompt)

| Agent | Use when |
|-------|----------|
| `branding-redesign` | Design system, tokens, components, rebrand |
| `ux-polish` | Flows, accessibility, mobile, states |
| `audit-explore` | Gaps, consistency, security, Visual QA |
| `senior-software-engineer` | Architecture, APIs, code review |
| `content-polish` | Copy, SEO, micro-copy |
| `seo-copywriter` | Meta tags, headings, alt text |
| `bug-fix` | Triage and fix bugs |

---

## Fallback

If `TEAM-AGENTS` is unavailable, use `generalPurpose` with the full prompt including agent context, e.g.:

> You are James Okonkwo and Kostas. Audit the Cyprus Winter design system...
