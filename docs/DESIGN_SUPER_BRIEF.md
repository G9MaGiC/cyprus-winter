# Design super brief — Cyprus Winter

**North star:** A quiet, premium winter field guide — calm motion, terracotta confidence, discovery-first.

**Persona:** See [`.cursor/UX_PERSONA.md`](../.cursor/UX_PERSONA.md) — *Cyprus secret*, no FOMO, Mediterranean warmth.

---

## Visual language

### Color (semantic)

| Token | Role |
|-------|------|
| Sand / cloud | Warm canvas |
| Charcoal / olive | Text hierarchy |
| Terracotta | Primary action |
| Aegean | Links, secondary nav, status |
| Golden | Accent on dark (hero, nav) |
| Sage | Trails, tips, meta |

Source: [`src/lib/brand-colors.ts`](../src/lib/brand-colors.ts) (canonical hex), [`src/lib/design-tokens.ts`](../src/lib/design-tokens.ts), [`src/app/globals.css`](../src/app/globals.css) (CSS vars — guarded by `brand-colors.test.ts`).

### Typography

- **Display:** Fraunces — hero, section titles, card headlines
- **UI / body:** Plus Jakarta Sans — forms, strips, nav
- **Kick ers:** `.prose-label` — uppercase tracked sans

### Shape & space

- CTAs: `rounded-xl`; chips: `rounded-full`; plan objects: `rounded-2xl`
- Hub sections: `py-12 sm:py-20`; strips: tighter rhythm
- Max widths: list `max-w-5xl`, detail `max-w-3xl`

---

## Motion & feeling

Full contract: [`docs/MOTION.md`](./MOTION.md).

**On tap:** 200ms color + `scale-[0.98–0.99]`.  
**On hover (desktop):** border warms terracotta, shadow lifts 300ms.  
**Overlays:** cookie → onboarding → AI; slide-up from bottom on mobile.  
**Never:** bounce, shake, confetti, parallax.

---

## Component feeling (summary)

| Surface | Feeling |
|---------|---------|
| Hero | Frosted panel on landscape; dual CTAs, no neon |
| Cards | Linen on sand; image-first 4:3 + bottom gradient |
| Sticky bars | Frosted sand (`STRIP.stickySandBar`); instrument panel |
| Plan empty | Blank notebook — dashed border, gentle nudge |
| Plan filled | Owned itinerary — shareable social object |
| Booking | Front desk calm — stepper, no celebration |
| AI | Concierge drawer — path-aware, disclaimer visible |

---

## Polish scorecard (Aug 2026)

| Dimension | Grade | Notes |
|-----------|-------|-------|
docs/DESIGN_SUPER_BRIEF.md
| Touch / thumb | A- | 44px, bottom chrome math |
| Motion restraint | A | No gratuitous animation |
| Motion delight | B | Discover reveal; home static until BUG-247 |
| Loading perception | B+ | Plan/trails/events aligned; more routes pending |
| Visual trust (photos) | C+ | Winery heroes still partner-dependent |
| Cognitive calm | B | Home/plan density for power users |

---

## Creative one-pager (handoff)

```
PROJECT: Cyprus Winter — winter guide & planner
AUDIENCE: Mobile, 4G, cultural explorers + hikers
PERSONALITY: Quiet confidence · Local secret · Mediterranean warmth
LOOK: Sand · Terracotta CTAs · Fraunces headlines · Soft shadows
MOTION: 200ms press · Rare reveals · No FOMO animation
AVOID: Neon · Beach cliché · OTA density · Gamification
SUCCESS: Oriented in 10s · Plan in 5 min · Trust booking photo
```

---

## Execution plan

Implementation branches: [`docs/superpowers/plans/2026-08-21-design-super-brief-execution.md`](./superpowers/plans/2026-08-21-design-super-brief-execution.md).

Photography: [`docs/PHOTOGRAPHY_GUIDELINES.md`](./PHOTOGRAPHY_GUIDELINES.md).
