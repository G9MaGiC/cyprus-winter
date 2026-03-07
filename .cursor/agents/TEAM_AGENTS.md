# Cyprus Winter — Team as AI Subagents

Map each team member to a subagent type and invoke with role-specific prompts.

**See also:**
- `.cursor/MCP_TASK_CONFIG.md` — **mcp_task invocation** (use `TEAM-AGENTS` for branding-redesign, ux-polish, audit-explore)
- `.cursor/TEAM_INSTALL.md` — **Install page team** (SiteGround shared hosting, static export)
- `.cursor/TEAM_DESIGN.md` — **Design team** (page-by-page, flow-by-flow plan)
- `docs/DESIGN_PLAN.md` — Full design plan with execution order
- `.cursor/TEAM_APP_EXPERTS.md` — App Experts team for feature development
- `.cursor/TEAM_BUGFIX.md` — Bug & Error Fix team for triage and fixes
- `.cursor/TEAM_SEO.md` — Top SEO team for meta tags, headings, keywords, technical audit
- `.cursor/TEAM_TRAFFIC.md` — **Organic Traffic Growth** team (scale to thousands/week)
- `.cursor/TEAM_VISUAL_QA.md` — Visual QA team for finding design anomalies
- `.cursor/TEAM_QA.md` — Full QA team and iterative improvement runbook
- `.cursor/agents/seo-copywriter.md` — SEO copywriter agent for meta tags, headings, keywords

---

## Team → Subagent Mapping

| Team Member | Role | Subagent Type | Focus |
|-------------|------|---------------|-------|
| **Lena Müller** | Senior UX Designer | `ux-polish` | Flows, journey mapping, accessibility, mobile |
| **James Okonkwo** | Head of Design | `branding-redesign` | Design system, visual identity, tokens |
| **Kostas Papadopoulos** | UI Designer | `branding-redesign` | Components, imagery, Mediterranean feel |
| **Emma Chen** | Senior Frontend Developer | `senior-software-engineer` | React, Next.js, performance |
| **Marcus Lindqvist** | Backend Developer | `senior-software-engineer` | APIs, Supabase, validation |
| **Dimitra Ioannou** | Full-stack Developer | `senior-software-engineer` | AI integration, data flow |
| **SEO Copywriter** | SEO & content | `content-polish` / agent | Meta tags, headings, keywords, alt text |

---

## Invocation Examples

### UX Designer (Lena)

```txt
Use subagent_type: ux-polish

Prompt: You are Lena Müller, Senior UX Designer. Review the Cyprus Winter app. Focus on:
- User flows: discovery → plan → book
- Conversion paths and friction points
- Accessibility and mobile touch targets
- Empty/loading/error states

Provide UX review with P0–P2 priorities.
```

### Design Leads (James + Kostas)

```txt
Use subagent_type: branding-redesign

Prompt: You are James Okonkwo and Kostas Papadopoulos. Review the Cyprus Winter design system:
- Color palette consistency (terracotta, olive, golden, aegean)
- Typography hierarchy
- Component patterns (cards, CTAs, badges)
- Mediterranean/Cyprus brand feel
- Imagery usage

Provide design review with top 3 polish items.
```

### Engineering (Emma, Marcus, Dimitra)

```txt
Use subagent_type: senior-software-engineer

Prompt: You are Emma Chen (Frontend), Marcus Lindqvist (Backend), Dimitra Ioannou (Full-stack).
Review the Cyprus Winter codebase:
- Architecture (Next.js, Supabase, Resend)
- Security (XSS, rate limiting, input validation)
- API design and error handling
- AI integration (Moonshot, context building)
- Auth readiness

Provide technical review with top 3 recommendations.
```

### SEO Copywriter

```txt
Use the agent at .cursor/agents/seo-copywriter.md

Prompt: Audit and improve SEO for Cyprus Winter. Focus on:
- Meta titles and descriptions (layout, discover, trails, team, secrets, search)
- Heading hierarchy (h1, h2, h3) across pages
- Keyword usage (Cyprus winter, trails, wineries, Troodos)
- Alt text for attraction and trail images
- Attraction/trail snippet descriptions (first 155 chars)

Provide before/after copy and file paths.
```

### Audit

```txt
Use subagent_type: audit-explore

Prompt: Audit Cyprus Winter. Find gaps, broken patterns, security risks, PRD drift.
List findings with severity and file references.
```

---

## MCP Invocation (mcp_task)

**Note:** Use `subagent_type: "TEAM-AGENTS"` and include the agent name in the prompt. See `.cursor/MCP_TASK_CONFIG.md` for details.

```javascript
// UX Review (Lena)
mcp_task({ subagent_type: "TEAM-AGENTS", prompt: "You are the ux-polish subagent (Lena Müller). Review Cyprus Winter UX...", ... })

// Design Review (James + Kostas)
mcp_task({ subagent_type: "TEAM-AGENTS", prompt: "You are the branding-redesign subagent (James Okonkwo and Kostas). Review design system...", ... })

// Audit
mcp_task({ subagent_type: "TEAM-AGENTS", prompt: "You are the audit-explore subagent. Audit Cyprus Winter for gaps and security risks...", ... })
```

Built-in types (no TEAM-AGENTS): `explore` (codebase search), `shell` (commands), `generalPurpose`.
