# Cyprus Winter — Full Branding Redesign Brief

**Purpose:** Top-level spec for redesigning the entire project with new branding. Use this when launching the branding redesign subagent or team.

---

## Scope

**Redesign the whole Cyprus Winter app** with new branding. This includes:

### 1. Brand Identity (New)
- **Color palette** — Replace current Mediterranean palette (terracotta, aegean, olive, sand, golden, charcoal) with a new system
- **Typography** — New font pairings (replace DM Sans + Playfair Display)
- **Logo/wordmark** — Refresh "Cyprus Winter" treatment
- **Voice & tone** — Align copy with new brand personality

### 2. Design System Update
- Update `src/app/globals.css` — CSS variables, theme tokens
- Update `@theme` in Tailwind
- Update `.cursor/skills/cyprus-tourism-app/SKILL.md` — design system reference

### 3. UI Components (Apply New Brand)
- **Nav** — Header, links, mobile menu
- **Cards** — AttractionCard, trail cards, toolkit cards
- **Buttons** — Primary, secondary, CTA styles
- **Badges** — Status, difficulty, tags

### 4. Pages (Full Pass)
- **Home** (`page.tsx`) — Hero, sections, CTAs
- **Discover** — List and detail pages
- **Trails** — List, detail, filters
- **Plan** — Itinerary builder
- **Airport** — Arrival info
- **Team** — Profiles
- **AI Assistant** — Chat bubble, panel, messages

### 5. Assets & Meta
- `viewport.ts` — themeColor
- Favicon, manifest, PWA icons (if applicable)
- Any SVG or image assets that carry old brand

---

## Current State (Reference)

| Token | Current Value | Location |
|-------|---------------|----------|
| Primary | Terracotta #e07a5f | CTAs, links |
| Secondary | Aegean #1a6b7c | Brand, headings |
| Text | Olive #3d405b / Charcoal #2b2d42 | Body, headings |
| Background | Sand #f4f1de | Page bg |
| Accent | Golden #f2cc8f | Highlights |
| Fonts | DM Sans, Playfair Display | Body, headings |

---

## Constraints

- **Mobile-first** — 375px+ viewport
- **AI-first** — Chat/voice assistant remains prominent
- **Content unchanged** — Trails, wineries, attractions data stay as-is; only presentation changes
- **Accessibility** — Maintain WCAG AA contrast after palette change
- **Performance** — No new heavy dependencies

---

## New Brand Direction (Applied)

**Refined Winter Escape** — Teal + amber, clean typography

| Token | New Value | Role |
|-------|-----------|------|
| terracotta | #0d9488 | Primary CTAs (teal) |
| aegean | #0f766e | Secondary / brand (dark teal) |
| golden | #d97706 | Accents (amber) |
| olive | #334155 | Body text (slate) |
| charcoal | #1e293b | Headings / nav |
| sand | #fafaf9 | Background |
| sage | #64748b | Muted text |

**Typography:** Inter (body), Fraunces (headings)

---

## New Brand Direction (To Be Defined in Future)

Before running another redesign, define:

1. **Mood** — e.g. "Premium winter escape", "Rugged adventure", "Minimal Nordic", "Luxury Mediterranean"
2. **Colors** — 5–7 token palette with hex values
3. **Typography** — 2 fonts (heading + body), with fallbacks
4. **Style** — Rounded vs sharp, light vs dark, gradient vs flat

If not specified, the subagent may propose a coherent new direction.

---

## Deliverables

1. Updated `globals.css` and Tailwind theme
2. Updated skill/design system doc
3. All component files updated to use new tokens
4. All pages visually refreshed
5. No hardcoded hex values — all via Tailwind classes

---

## How to Run

**Invoke the branding redesign subagent:**

```
Redesign the Cyprus Winter app with new branding. Follow .cursor/REDESIGN_BRIEF.md.

[Optional: Specify new brand direction, e.g.]
New brand: [mood], colors [list], fonts [pair].
```

Or use the `branding-redesign` subagent (see .cursor/agents/branding-redesign.md).
