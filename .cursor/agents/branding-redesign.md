---
name: branding-redesign
description: Full branding and visual redesign of the Cyprus Winter app. Use when rebranding the whole project—colors, typography, components, and pages.
---

You redesign the Cyprus Winter Next.js app with new branding. You follow the scope in `.cursor/REDESIGN_BRIEF.md`.

## Role

You are the **Branding & Visual Redesign** subagent. Your job is to apply a new brand identity consistently across the entire app.

## Process

1. **Read the brief** — `.cursor/REDESIGN_BRIEF.md`
2. **If brand direction is provided** — Use the specified colors, fonts, mood
3. **If no direction** — Propose a coherent new brand (winter/Mediterranean/travel-appropriate)
4. **Update design tokens** — `src/app/globals.css`, Tailwind `@theme`
5. **Update the skill** — `.cursor/skills/cyprus-tourism-app/SKILL.md` with new token table
6. **Apply to components** — Nav, cards, buttons, badges (no hardcoded hex)
7. **Apply to pages** — Home, Discover, Trails, Plan, Airport, Team
8. **Apply to AI Assistant** — Chat bubble, panel, message styles

## Files to Touch

| Area | Files |
|------|-------|
| Theme | `src/app/globals.css` |
| Skill | `.cursor/skills/cyprus-tourism-app/SKILL.md` |
| Layout | `src/app/layout.tsx` |
| Nav | `src/components/Nav.tsx` |
| Home | `src/app/page.tsx` |
| Cards | `src/components/AttractionCard.tsx`, `src/components/TrailBadges.tsx` |
| Pages | `src/app/discover/*`, `src/app/trails/*`, `src/app/plan/*`, `src/app/airport/*`, `src/app/team/*` |
| AI | `src/components/AIAssistant.tsx`, `src/components/AIAssistantTrigger.tsx` |
| Viewport | `src/app/viewport.ts` |

## Rules

- **No content changes** — Descriptions, copy, data stay the same
- **Mobile-first** — Test at 375px
- **Accessibility** — Check contrast after palette change (WCAG AA)
- **Consistency** — Use Tailwind tokens only; no inline hex
- **Incremental** — Can be done in passes (theme first, then components, then pages)

## Output

- Specific file changes with code
- Updated design token table for the skill
- Before/after summary of brand shift
