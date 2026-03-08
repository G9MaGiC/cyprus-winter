# Mobile-First Redesign Summary — March 2026

## Overview

Refined mobile-first redesign with Mediterranean warmth. Typography and whitespace over decoration. Subtle wow factor without overdoing it.

## Changes

### 1. Design Tokens (globals.css, design-tokens.ts)

**Palette — Mediterranean warmth:**
- **Terracotta** #c96f52 — Primary CTAs, links
- **Aegean** #1a6b7c — Secondary, sea accent
- **Golden** #d4a853 — Accents, nav, hero
- **Sand** #faf8f5 — Background (warm cream)
- **Charcoal** #252730 — Headings
- **Olive** #4a5162 — Body text
- **Sage** #6b8f7a — Trail markers, sustainable

**New tokens:**
- `--touch-target: 44px` — Mobile tap targets
- `TOUCH_TARGET` in design-tokens
- `TRANSITION` (fast, smooth, medium)
- `CARD.mediaOverlay` — Shared gradient for card images

**Card & hero refinements:**
- CARD.base: softer shadow, warmer feel
- CARD.hover: 300ms ease-out, refined shadow
- HERO.overlay: refined gradient
- HERO.panel: stronger depth, transition-shadow

### 2. Components

| Component | Change |
|-----------|--------|
| **Nav** | bg-charcoal/97, border-white/10, subtle shadow |
| **BottomNav** | 52×48px tap targets, rounded-xl, shadow, active feedback |
| **AttractionCard** | CARD.mediaOverlay, scale 1.03 on hover, CARD.interactive |
| **TrailCard** | Same overlay + hover |
| **CTA.primary** | min-h-44px, active:scale-[0.99], touch-manipulation |

### 3. Micro-interactions

- **Section reveal:** `.section-reveal` — subtle fade-in (0.5s) on key sections; respects `prefers-reduced-motion`
- **Card hover:** scale 1.03, 300ms ease-out
- **Primary CTA:** active scale feedback
- **BottomNav:** active:bg-white/5 on tap

### 4. Pages

- **Home:** Section reveal on "Where to today" search block
- **Discover:** Section reveal on "Find a place" search block
- **Plan, Trails:** Cohesive LAYOUT/SECTION tokens; no structural changes

## Mobile-First Checklist

- [x] 44px+ touch targets on nav, CTAs, cards
- [x] Bottom nav: 52×48px items, thumb-zone friendly
- [x] Safe area insets preserved
- [x] Typography unchanged (Fraunces + Plus Jakarta Sans)
- [x] No new dependencies

## Files Touched

- `src/app/globals.css`
- `src/lib/design-tokens.ts`
- `src/components/Nav.tsx`
- `src/components/BottomNav.tsx`
- `src/components/AttractionCard.tsx`
- `src/components/TrailCard.tsx`
- `src/app/page.tsx`
- `src/app/(padded)/discover/page.tsx`
- `.cursor/skills/cyprus-tourism-app/SKILL.md`
