# Motion — Cyprus Winter

Contract for animation and micro-interaction. Aligns with [`.cursor/UX_PERSONA.md`](../.cursor/UX_PERSONA.md) and [`src/lib/design-tokens.ts`](../src/lib/design-tokens.ts).

## Principles

1. **Calm, not sluggish** — 200ms for UI feedback; 300ms for panels and sticky context.
2. **Press, don't bounce** — `active:scale-[0.98]` on primary controls; no elastic or shake.
3. **Respect reduced motion** — global override in `src/app/globals.css`; never rely on animation alone for meaning.
4. **Confirm action** — color shift + slight scale; no confetti, particles, or gamification.

## Token mapping

| Token | Value | Use |
|-------|-------|-----|
| `TRANSITION.fast` | 150ms ease | Rare micro-states |
| `TRANSITION.smooth` | 0.2s ease | Buttons, links, chips |
| `TRANSITION.medium` | 0.3s ease | Onboarding sheet, sticky reveals |
| `CARD.interactive` | scale 0.99, 150ms | Card press |
| `CARD.hover` | shadow lift, 300ms | Desktop card hover |
| `CTA.primary` | scale 0.99 + color, 200ms | Main actions |

## Keyframes (globals.css)

| Class | Duration | When |
|-------|----------|------|
| `.section-reveal` | 500ms ease-out | First paint of discover/home sections (stagger ≤80ms) |
| `.ai-chat-panel-enter` | 250ms ease-out | AI panel open |
| `.ai-chat-trigger-pulse` | 2s infinite | First-visit AI discoverability only (localStorage gate) |

All three disable under `@media (prefers-reduced-motion: reduce)`.

## When to add motion

| Do | Don't |
|----|-------|
| Sticky bar backdrop blur on scroll | Parallax hero |
| Image `scale-105` on card hover (300ms) | Looping attention animations |
| Slide-up onboarding from bottom | Full-page route transitions |
| Copy-link terracotta ring (200ms) | Success confetti |

## Implementation checklist (PRs)

- [ ] Uses design tokens, not ad-hoc durations
- [ ] `motion-reduce:` / global reduced-motion safe
- [ ] Guard test if introducing new global class (see `dr-leftover-polish.test.ts`)
- [ ] E2E if home/plan/overlays touched

See also: [`docs/DESIGN_SUPER_BRIEF.md`](./DESIGN_SUPER_BRIEF.md), [`docs/UX_PATTERNS.md`](./UX_PATTERNS.md).
