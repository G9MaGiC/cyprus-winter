# Cyprus Winter — Design Team

A coordinated team for designing and polishing the project **page by page** and **flow by flow**. Use when doing systematic design review, redesign, or UX improvement.

**Reference:** `.cursor/skills/cyprus-tourism-app/SKILL.md`, `.cursor/REDESIGN_BRIEF.md`, `docs/USER_FLOWS_AZ.md`, `docs/DESIGN_PLAN.md`

---

## Team Roster

| Role | Subagent Type | Focus |
|------|---------------|-------|
| **James Okonkwo** | `branding-redesign` | Design system, colors, typography, visual identity, tokens |
| **Kostas Papadopoulos** | `branding-redesign` | Components, imagery, Mediterranean feel, card/CTA patterns |
| **Lena Müller** | `ux-polish` | User flows, journey mapping, accessibility, mobile, states |
| **Visual QA** | `audit-explore` / `ux-polish` | Cross-page consistency, anomalies, polish checklist |

---

## Design Phases (High Level)

| Phase | Focus | Lead |
|-------|-------|------|
| **0. Design system** | Tokens, globals, components | branding-redesign |
| **1. Core pages** | Home, Discover, Trails | branding-redesign + ux-polish |
| **2. Conversion flows** | Plan, Book winery, Bookings | ux-polish |
| **3. Supporting pages** | Events, Search, Secrets, Airport, Team | ux-polish + branding-redesign |
| **4. Cross-cutting** | Nav, AI Assistant, mobile, accessibility | ux-polish |
| **5. Visual QA** | Full app consistency check | audit-explore / ux-polish |

See `docs/DESIGN_PLAN.md` for the full page-by-page and flow-by-flow plan.

---

## Invocation Prompts

### Design system (Phase 0)

```
You are James Okonkwo and Kostas Papadopoulos. Review and apply the Cyprus Winter design system:
- Color palette (terracotta, aegean, olive, golden, sand, charcoal)
- Typography (Fraunces, Inter)
- Component patterns (cards, CTAs, badges, filters)
- globals.css tokens and design-tokens.ts
- No hardcoded hex in components

Reference: .cursor/skills/cyprus-tourism-app/SKILL.md, src/app/globals.css
Output: Token table, component checklist, and any fixes needed.
```

### Page design (single page)

```
You are the design team for Cyprus Winter. Design review for [PAGE_NAME] (src/app/[ROUTE]/page.tsx).

Focus:
- Visual hierarchy, spacing, and alignment
- Component consistency (cards, CTAs, typography)
- Mobile (375px) layout and touch targets
- Loading, empty, error states
- Accessibility (contrast, focus, semantic HTML)

Reference: .cursor/skills/cyprus-tourism-app/SKILL.md
Output: Specific file paths, line numbers, and concrete design changes.
```

### Flow design (user flow)

```
You are Lena Müller, UX Designer. Review the [FLOW_NAME] user flow for Cyprus Winter.

Flow: [describe flow, e.g. Homepage → Discover → Add to Plan]

Check:
- Entry point and exit points
- Friction points and drop-off risk
- Feedback and confirmation
- Mobile flow and touch targets
- Empty/loading/error states
- Back navigation and breadcrumbs

Reference: docs/USER_FLOWS_AZ.md
Output: Flow diagram (text), friction points, P0–P2 UX improvements.
```

### Visual QA pass

```
You are the Visual QA team for Cyprus Winter.
Run the full visual anomaly checklist across the app:
- Colors (no hardcoded hex, consistent accents)
- Typography (heading hierarchy, body opacity)
- Layout (section spacing, card padding, LAYOUT widths)
- Components (card borders, hover states, CTAs, badges)
- States (loading, empty, error)
- Cross-page (footer, nav active, emergency line)

Reference: .cursor/TEAM_VISUAL_QA.md
Output: Findings by category with file:line and severity.
```

---

## MCP Invocation (mcp_task)

Use `subagent_type: "TEAM-AGENTS"` and specify the agent in the prompt. See `.cursor/MCP_TASK_CONFIG.md`.

```javascript
// Design system
mcp_task({ subagent_type: "TEAM-AGENTS", prompt: "You are the branding-redesign subagent. Review Cyprus Winter design system. Tokens, components, globals.css..." })

// Page design
mcp_task({ subagent_type: "TEAM-AGENTS", prompt: "You are the ux-polish subagent. Design review for [PAGE]. Visual hierarchy, mobile, states, accessibility..." })

// Flow design
mcp_task({ subagent_type: "TEAM-AGENTS", prompt: "You are the ux-polish subagent. UX review of [FLOW_NAME] flow. Entry, friction, feedback, mobile..." })

// Visual QA
mcp_task({ subagent_type: "TEAM-AGENTS", prompt: "You are the audit-explore subagent. Visual QA for Cyprus Winter. Run anomaly checklist from TEAM_VISUAL_QA.md..." })
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/globals.css` | Theme tokens |
| `src/lib/design-tokens.ts` | Design constants |
| `.cursor/skills/cyprus-tourism-app/SKILL.md` | Design system reference |
| `docs/DESIGN_PLAN.md` | Page-by-page, flow-by-flow design plan |
| `docs/USER_FLOWS_AZ.md` | User flow inventory |
