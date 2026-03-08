---
name: cyprus-tourism-app
description: Build and extend the Cyprus tourism Next.js app with consistent architecture, Mediterranean design, and tourism domain patterns. Use when developing features for cyprus-winter, adding attractions, airport content, team profiles, or UI components.
---

# Cyprus Tourism App — Agent Skill

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 with custom theme
- **Fonts**: Plus Jakarta Sans (body), Fraunces (headings)
- **Data**: Static TypeScript in `src/data/` — no backend/DB

## UX Persona

Apply the lens in `.cursor/UX_PERSONA.md`: Cyprus Winter as a premium, secret-app — understated, discovery-first, Mediterranean warmth. Typography and whitespace over decoration. No emojis, no loud CTAs, no hustle.

## Design System

### Token audit (2026 Earth-inspired — Mediterranean warmth)

**Sources:** `src/app/globals.css` (:root + @theme), `src/lib/design-tokens.ts` (TOKENS, LAYOUT, SECTION, CARD, EMPTY_STATE). Use these as the source of truth for actual hex values; the table below may reflect an alternate palette.

| Purpose | Tailwind Class | Hex | Notes |
|---------|----------------|-----|-------|
| Background | `background`, `cloud` | #FAF8F5 | body, surfaces |
| Background alt | `sand`, `sand-100` | #F5F2ED | cards, inputs |
| Borders | `sand-200`, `sand-300` | #EAE6DF, #D4CFC5 | `sand-mid`, `sand-dark` in :root |
| Primary accent (CTAs, links) | `terracotta` | #C96F52 | Use `TOKENS.terracotta` for inline styles (Leaflet, etc.) |
| Primary muted | `terracotta-muted` | #B85D42 | Hover states |
| Secondary (text) | `olive` | #4A5162 | Body text |
| Muted text | `olive-muted`, `olive/70` | #6B7280 | Labels, captions |
| Text, headings | `charcoal` | #252730 | Same as olive for contrast |
| Accent (golden hour) | `golden` | #D4A853 | Nav, hero CTA |
| Sea/water accent | `aegean` | #1A6B7C | Status open, secondary CTAs |
| Earth accent | `sage` | #6B8F7A | Trail markers, sustainable badges |
| Sage muted | `sage-muted` | #8FA99A | — |

**Spacing:** Tailwind default scale (p-2, p-4, gap-2, etc.). Layout: `LAYOUT.safeAreaX`, `LAYOUT.pagePy`, `LAYOUT.pagePyDetail`, `SECTION.py`, `SECTION.pySub`.

**Layout usage:**
- `LAYOUT.list` (max-w-5xl): list pages (Discover, Trails, Plan, Events, etc.)
- `LAYOUT.listNarrow` (max-w-4xl): airport, footer
- `LAYOUT.detail` (max-w-3xl): detail pages (discover/[id], trails/[id])
- `LAYOUT.form` / `LAYOUT.formNarrow`: forms (bookings, search, trail report)
- `LAYOUT.pagePy`: list/form page vertical padding (py-12 sm:py-16)
- `LAYOUT.pagePyDetail`: detail page vertical padding (py-8 sm:py-12)
- `EMPTY_STATE`: empty-state card styling (no results, no items)
- `EMPTY_STATE_DASHED`: dashed-border variant for "add first" flows (plan empty day, no bookings)
- `EMPTY_STATE_COMPACT`: compact empty state (search "no results")
- `CARD.contentLg`: content-heavy sections (p-6 sm:p-8)
- `LAYOUT.stickyBarX`: edge-to-edge sticky bar padding (filters, day selector)
- `LAYOUT.heroBleedX`: hero components that bleed to viewport edges (-mx-4 sm:-mx-6)

**Typography scale (globals.css):**
- `prose-intro`: 1.125rem, line-height 1.7
- `prose-body`: line-height 1.7
- `prose-label`: 0.75rem, font-weight 600, uppercase, letter-spacing 0.1em
- `prose-quote`: line-height 1.65
- Headings: `font-display` (Fraunces); body: `font-sans` (Plus Jakarta Sans)

### Component checklist

| Component | Token usage | Patterns | Issues |
|-----------|-------------|----------|--------|
| AttractionCard | ✓ CARD, Tailwind tokens | Hover scale, type badge map | Badge `rounded-md` (skill said `rounded-full` — either is OK) |
| TrailCard | ✓ CARD, StatusBadge, DifficultyBadge | Featured border-aegean variant | None |
| TrailBadges | ✓ StatusBadge, DifficultyBadge | All Tailwind tokens | None |
| FilterChips | ✓ sand-200, olive, terracotta ring | Active: bg-olive/90; focus ring olive/50 | None |
| Buttons (AddToItinerary, Nav, PlacePicker) | ✓ terracotta, aegean, golden | min-h-[44px], focus-visible ring | None |
| AllTrailsMap, TrailMap | ✓ Use `TOKENS.sage`, `TOKENS.terracotta` | Leaflet inline styles require hex — use TOKENS | Fixed |
| AIAssistant | ✓ charcoal, terracotta, sand-100 | Floating CTA, chat bubbles | None |
| error.tsx, not-found.tsx | ✓ LAYOUT.safeAreaX, pagePy, CTA | Centered full-screen layout | None |
| TrailDetailStickyActions | ✓ LAYOUT.detail, safeAreaX | Sticky bar with Add to plan, Report | None |

### UI Patterns
- Cards: use `CARD` from design-tokens — `CARD.base` + `CARD.hover`, `CARD.link`; use `CARD.content` (p-5 sm:p-6) for card body padding
- Primary CTA: `bg-terracotta text-white rounded-lg px-8 py-3 font-semibold`
- Secondary CTA: `border-2 border-aegean text-aegean` or `border border-terracotta/80 text-terracotta` + `rounded-lg`
- Badges/tags: `rounded-md text-xs px-2.5 py-1` + semantic colors (e.g. `bg-aegean/20 text-aegean`, `bg-sand-100 text-olive/80`)

## Architecture

```
src/
├── app/              # App Router pages
│   ├── airport/      # LCA & PFO info
│   ├── discover/     # Attractions list + [id] detail
│   ├── trails/       # Troodos trail conditions
│   ├── plan/         # Itinerary builder (client)
│   ├── team/         # Expert team profiles
│   └── page.tsx      # Home
├── components/       # Reusable UI
│   ├── Nav.tsx       # Global nav (client)
│   └── AttractionCard.tsx
└── data/             # Static content
    ├── attractions.ts
    ├── airport.ts
    ├── trails.ts
    ├── wineries.ts
    └── team.ts
```

## Data Models

### Attraction (`src/data/attractions.ts`)
```ts
type Attraction = {
  id: string;           // kebab-case, unique
  name: string;
  region: string;       // e.g. "Ayia Napa", "Paphos"
  description: string;  // 1–2 sentences
  type: "beach" | "ancient" | "village" | "monastery" | "nature";
  highlights: string[]; // 3–5 short labels
  image: string;        // path e.g. "/beaches/nissi.jpg"
  bestFor: string[];    // e.g. ["Families", "Swimming"]
};
```

### Airport (`src/data/airport.ts`)
```ts
type Airport = {
  code: string;         // "LCA" | "PFO"
  name: string;
  city: string;
  transport: TransportOption[];
  tips: string[];
};
type TransportOption = {
  type: string;         // "Taxi" | "Bus" | "Car rental"
  description: string;
  approxCost: string;   // e.g. "€25–45 to Larnaca"
  duration?: string;
  tip?: string;
};
```

### TeamMember (`src/data/team.ts`)
```ts
type TeamMember = {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  bio: string;
  linkedIn?: string;
};
```

## Adding New Content

### New attraction
1. Add to appropriate array in `src/data/attractions.ts` (beaches, ancientSites, villages, monasteries).
2. Use valid `type`; keep `id` kebab-case and unique.
3. If new type, add to union and handle in `AttractionCard` typeColors.

### New page
1. Create `src/app/[route]/page.tsx`.
2. Use `LAYOUT.safeAreaX`, `LAYOUT.pagePy` (or `pagePyDetail` for detail pages), and appropriate `LAYOUT.list` / `LAYOUT.detail` / `LAYOUT.form` width.
3. Add link to `Nav.tsx` links array.
4. Optionally add to homepage toolkit grid.

### New component
- Use Tailwind with design tokens above.
- Prefer server components; use `"use client"` only when needed (state, onClick, usePathname).

## Quality Checklist

- [ ] New pages include `Link` back (e.g. "← Back") where appropriate
- [ ] Mobile-first: test layouts at 375px and up (chat components: test primary flows at 375px viewport)
- [ ] No hardcoded hex in JSX — use Tailwind classes
- [ ] Data files export typed arrays; keep content factual for Cyprus
- [ ] Images: use gradient placeholders until real assets; path under `/public`
