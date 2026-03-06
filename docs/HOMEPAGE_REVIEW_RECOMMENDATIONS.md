# Cyprus Winter — Homepage Layout and Content Review

**Date:** March 2026  
**Scope:** [src/app/page.tsx](src/app/page.tsx)  
**Reviewers:** UX (Lena Müller), Content (content-polish), Design (James Okonkwo, Kostas Papadopoulos)

---

## Executive summary

The homepage has a clear discovery-first structure with good touch targets and accessibility. The main opportunities are: (1) improving conversion by surfacing Plan earlier or adding a sticky CTA, (2) tightening copy and messaging hierarchy, (3) fixing section visual rhythm and card consistency.

---

## P0 — High impact, quick wins

### Layout / structure

| Finding | Recommendation | Source |
|---------|----------------|--------|
| Plan/Events may be too low for conversion | A/B test moving Plan/Events higher or adding sticky "Plan your trip" bar after scroll on mobile | UX |
| Section order | Consider hybrid order: Hero → Explore → Right now → Editor's picks → Plan/Events → Why Cyprus | UX |

### Content / messaging

| Element | Current | Recommended | Rationale |
|---------|---------|-------------|-----------|
| Eyebrow | Your guide to Cyprus in winter | The Mediterranean's best-kept secret | More editorial, discovery-led; avoids generic "guide" |
| Ghost CTA | Just landed? | Just arrived? | Matches MESSAGING doc; warmer, more inclusive |

---

## P1 — Strong improvements

### Layout / structure

| Finding | Recommendation | Source |
|---------|----------------|--------|
| No "Add to plan" on homepage cards | Add AddToItineraryButton (or inline affordance) on Editor's picks and Right now cards | UX |
| Editor's picks 4-col feels tight at lg | Change to 2-col at lg: `grid-cols-1 sm:grid-cols-2` (drop lg:grid-cols-4) | UX |
| Local secrets missing from hero | Align with USER_FLOWS_AZ or document removal | UX |
| Plan/Events far below fold | Add sticky "Plan your trip" CTA after scroll depth on mobile | UX |

### Content / messaging

| Element | Current | Recommended | Rationale |
|---------|---------|-------------|-----------|
| Right now heading | Right now | This week | More editorial, current |
| Right now subline | Coast mild, Troodos cooler. Pick a trail, a winery, or see what's on. | Coast mild, Troodos cooler. Hike, taste, or see what's on. | Shorter, warmer verbs |

### Visual structure

| Finding | Recommendation | Source |
|---------|----------------|--------|
| Hero overlay complex | Simplify to single gradient: `from-charcoal via-charcoal/50 to-charcoal/5` | Design |
| Section alternation broken | Explore and Right now both use SECTION.alt; remove from one. Suggested: Explore (alt) → Right now (default) → Editor's picks (alt) → Plan (default) → Why Cyprus (alt) | Design |
| CTA object page-local | Move CTA object to `design-tokens.ts` and import in page.tsx | Design |

---

## P2 — Polish and optional

### Layout / structure

| Finding | Recommendation | Source |
|---------|----------------|--------|
| Hero height on mobile | Test shorter hero (~65–70vh) | UX |
| Cross-flow copy | Add bridging copy: "Add trails and wineries from Discover" in Plan card | UX |
| Horizontal scroll for picks | Optional horizontal scroll for Editor's picks on mobile | UX |

### Content / messaging

| Element | Current | Recommended | Rationale |
|---------|---------|-------------|-----------|
| Intro | Trails, villages, wine, events. Plan from home or start when you land. | Trails, villages, wine, events. Plan ahead or start when you land. | Shorter, warmer |
| Editor's picks sub | Four places we keep coming back to. | Our favorites. Four we keep coming back to. | Clearer ownership |
| More chips label | More: Culture, Coasts, Monasteries | Also: Culture, Coasts, Monasteries | Softer, less list-like |

### Visual structure

| Finding | Recommendation | Source |
|---------|----------------|--------|
| Editor's picks card hover | Align with CARD tokens or add CARD.imageCard variant; avoid overriding CARD.hover | Design |
| Section header spacing | Use SECTION.headingGap consistently (mb-6 sm:mb-8) instead of mixed mb-8, mb-10 sm:mb-12 | Design |

---

## Section order alternatives

### A. Discovery-first (picks before utility)
```
Hero → Explore → Editor's picks → Right now → Plan/Events → Why Cyprus
```

### B. Conversion-first (plan early)
```
Hero → [Plan + Events, compact 2-col] → Explore → Editor's picks → Right now → Why Cyprus
```

### C. Hybrid (recommended)
```
Hero → Explore → Right now → Editor's picks → Plan/Events → Why Cyprus
```
Matches current order; add sticky Plan CTA and "Add to plan" on cards to improve conversion without reordering.

---

## Card layout recommendations

| Section | Current | Recommended |
|---------|---------|-------------|
| Editor's picks | 1→2→4 cols | 1→2 cols (drop 4-col at lg) for larger images |
| Right now | 3-col (sm) | Keep |
| Plan + Events | 2-col (sm) | Keep |

---

## Copy alternatives (reference)

| Element | Warmer | Direct | Editorial |
|---------|--------|--------|-----------|
| Eyebrow | The Mediterranean's best-kept secret | Cyprus in winter — plan & explore | A quiet season |
| Intro | Hikes, ruins, villages. Plan ahead or discover on arrival. | Trails, villages, wine. Plan it — or wing it. | Plan from home. Or just land and explore. |
| Primary CTA | Start exploring | Discover | Discover |

---

## Implementation order

1. **Quick wins:** Eyebrow, ghost CTA, hero overlay simplification, section alt alternation
2. **Conversion:** Sticky Plan CTA (mobile), "Add to plan" on cards
3. **Structure:** Editor's picks 2-col, CTA to design-tokens, SECTION.headingGap
4. **Optional:** Right now copy tweaks, hero height test, horizontal scroll
