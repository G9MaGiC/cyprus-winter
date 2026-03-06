# Cyprus Winter — Branding Redesign Team

Top-level coordination for **full project redesign with new branding**.

---

## Quick Start

To redesign the whole app with new branding:

1. **Define the new brand** (or let the agent propose one):
   - Mood (e.g. premium winter, rugged adventure, minimal Nordic)
   - Color palette (5–7 hex values)
   - Typography (2 fonts)

2. **Run the branding redesign subagent** with the `branding-redesign` agent (see `.cursor/agents/branding-redesign.md`).

3. **Or invoke with mcp_task:**
   - `subagent_type`: `ux-polish` or `senior-software-engineer`
   - `prompt`: Reference `.cursor/REDESIGN_BRIEF.md` and specify brand direction

---

## Team Top: Redesign Scope

| Layer | Scope |
|-------|-------|
| **Brand** | Colors, fonts, logo treatment, voice |
| **Theme** | globals.css, Tailwind @theme |
| **Components** | Nav, cards, buttons, badges |
| **Pages** | Home, Discover, Trails, Plan, Airport, Team |
| **AI** | Chat bubble, panel, messages |

---

## Documents

| Document | Purpose |
|----------|---------|
| `.cursor/REDESIGN_BRIEF.md` | Full scope, constraints, deliverables |
| `.cursor/agents/branding-redesign.md` | Subagent instructions for redesign |
| `.cursor/skills/cyprus-tourism-app/SKILL.md` | Design system (update after redesign) |

---

## Invocation Prompt (Copy-Paste)

```
Redesign the Cyprus Winter app with new branding. Follow .cursor/REDESIGN_BRIEF.md and .cursor/agents/branding-redesign.md.

[Optional: Add your brand direction]
New brand: [mood]. Colors: [list with hex]. Fonts: [heading font], [body font].
```

---

## Checklist (Post-Redesign)

- [ ] globals.css updated with new tokens
- [ ] Skill doc updated with new palette
- [ ] Nav, cards, buttons use new tokens
- [ ] All pages visually refreshed
- [ ] AI Assistant styled
- [ ] No hardcoded hex in components
- [ ] Contrast checked (WCAG AA)
- [ ] Mobile (375px) verified
