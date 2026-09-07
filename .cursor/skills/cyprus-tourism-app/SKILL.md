---
name: cyprus-tourism-app
description: Build and extend the Cyprus tourism Next.js app with consistent architecture, Mediterranean design, and tourism domain patterns. Use when developing features for cyprus-winter, adding attractions, airport content, team profiles, or UI components.
---

# Cyprus Tourism App — Agent Skill

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 with custom theme
- **Fonts**: Plus Jakarta Sans (body), Fraunces (headings)
- **Data**: **Curated content** in `src/data/` (TypeScript, git-versioned) is the product source of truth for places, trails, wineries, events, Plan templates, etc.
- **Server & persistence**: **Next.js API routes** (`src/app/api/*`) with Zod; **Supabase** (bookings, `conversion_events`, trail reports) and **Resend** when env is configured; **Upstash** (or in-memory) rate limits. **Do not** assume “static only”—check the route and `src/lib/*` for the real data path.
- **Deeper product context**: `.cursor/PRODUCT_DEEP.md`

## UX Persona

Apply the lens in `.cursor/UX_PERSONA.md`: Cyprus Winter as a premium, secret-app — understated, discovery-first, Mediterranean warmth. Typography and whitespace over decoration. No emojis, no loud CTAs, no hustle.

## Design System

**Motion & visual language:** [`docs/DESIGN_SUPER_BRIEF.md`](../../docs/DESIGN_SUPER_BRIEF.md) · [`docs/MOTION.md`](../../docs/MOTION.md)

### Token audit (2026 Earth-inspired — Mediterranean warmth)

**Sources:** `src/app/globals.css` (:root + @theme), `src/lib/design-tokens.ts` (TOKENS, LAYOUT, SECTION, CARD, EMPTY_STATE). Use these as the source of truth for actual hex values; the table below may reflect an alternate palette.

| Purpose | Tailwind Class | Hex | Notes |
|---------|----------------|-----|-------|
| Background | `background`, `cloud` | #FAF8F5 | body, surfaces |
| Background alt | `sand`, `sand-100` | #F5F2ED | cards, inputs |
| Borders | `sand-200`, `sand-300` | #EAE6DF, #D4CFC5 | `sand-mid`, `sand-dark` in :root |
| Primary accent (CTAs, links) | `terracotta` | #B55738 | Use `TOKENS.terracotta` for inline styles (Leaflet, etc.) |
| Primary muted | `terracotta-muted` | #9C4B30 | Hover states |
| Secondary (text) | `olive` | #4A5162 | Body text |
| Muted text | `muted-ink`, `olive-muted` | #646975, #6B7280 | Labels, captions — use `text-muted-ink` (WCAG AA); never `text-olive/50-80` opacity |
| Text, headings | `charcoal` | #252730 | Same as olive for contrast |
| Accent (golden hour) | `golden` | #D4A853 | Nav, hero CTA |
| Sea/water accent | `aegean` | #1A6B7C | Status open, secondary links, opt-in, navigation bars |
| Earth accent | `sage` | #526C5C | Trail markers, sustainable badges |
| Golden as text on light | `golden-ink` | #886522 | Kickers/labels on light surfaces; `golden` itself is for dark surfaces only |

### CTA hierarchy

| Context | Color | Token(s) | Use case |
|---------|-------|----------|----------|
| Primary | Terracotta | `CTA.primary`, `primaryCompact`, `chipPrimary` | Main actions: Explore, Plan, Book, Add to plan |
| Secondary on dark | Golden | `CTA.secondary`, `tertiaryOnDark`, `ghost` | Hero panel, dark overlays; white text, hover golden |
| Secondary on light | Aegean or Terracotta outline | `CTA.secondaryCompact`, `SECTION.aegeanLink`, `border-2 border-aegean` | Contextual links, alternate hierarchy when primary is terracotta |

### Aegean usage

| Pattern | Use case | Examples |
|---------|----------|----------|
| Links | Secondary/contextual links on light backgrounds | `SECTION.aegeanLink`, "Pair with", "See also" |
| Pair with / contextual suggestions | SuggestedForDay, QuickStart, related places | `text-aegean`, `bg-aegean/5` |
| Opt-in / secondary actions | PushOptIn, TemplateChoiceModal | `bg-aegean`, `border-aegean` |
| Status / badges | Open, confirmed, trail difficulty easy | TrailBadges, bookings status |
| Navigate / wayfinding | NavigateButton (default), Add to plan variant | Border aegean |

### One-off components (aegean usage)

| Component | Current | Semantic role |
|-----------|---------|---------------|
| NavigateButton (default) | `text-aegean border-aegean/30` | Navigation/wayfinding helper — aegean for secondary navigation |
| PushOptIn | `bg-aegean` CTA | Opt-in, non-primary — aegean for secondary/opt-in actions |

### Flex / grid alignment

| Pattern | Use case | Examples |
|---------|----------|----------|
| `flex items-center` | Horizontal row, vertically centered | Nav links, inline badges, chip rows |
| `flex items-center justify-between` | Row with space between ends | Disclosure summary, strip headers |
| `flex flex-wrap items-center gap-2` | Wrapping row, consistent spacing | CTA groups, chips, action buttons |
| `flex flex-col gap-4` | Vertical stack | Hero CTAs, form sections, card content |
| `flex flex-col sm:flex-row items-center gap-3 sm:gap-4` | Responsive: column on mobile, row on desktop | Hero button group, modal actions |
| `grid gap-4 sm:grid-cols-2 sm:gap-6` | Card grids | StartHereStrip, plan templates, discover list |

**Spacing (gap):** Prefer Tailwind scale: `gap-2` (8px) for tight inline, `gap-3` (12px) for buttons/chips, `gap-4` (16px) for sections, `gap-6` (24px) for major blocks. Use `gap-x-4 gap-y-1` for inline links with minimal vertical gap.

**Layout:** Tailwind default scale (p-2, p-4, gap-2, etc.). Structural: `LAYOUT.safeAreaX`, `LAYOUT.pagePy`, `LAYOUT.pagePyDetail`, `SECTION.py`, `SECTION.pySub`.

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

### Brand checklist (new components)

When adding components, use:
- **Primary CTA:** terracotta (`CTA.primary`, `primaryCompact`, `chipPrimary`)
- **Secondary/contextual links:** aegean (`SECTION.aegeanLink`, `border-2 border-aegean`)
- **Accent on dark surfaces:** golden (hero panel, nav, dark overlays)
- **Imagery:** Cyprus-specific, winter-appropriate. Avoid summer/beach scenes that contradict "winter escape."

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

### Transitions (TRANSITION from design-tokens)
- `TRANSITION.fast`: 150ms — micro-feedback (button active)
- `TRANSITION.smooth`: 0.2s — hover, focus
- `TRANSITION.medium`: 0.3s — card hover, panel reveal. Prefer these over arbitrary `duration-200`/`duration-300` for consistency.
- `CARD.featured`: hero/featured cards — `border-2 border-aegean/20`; compose with `CARD.base` + `CARD.hover`.

### UI Patterns
- Cards: use `CARD` from design-tokens — `CARD.base` + `CARD.hover`, `CARD.link`; use `CARD.content` (p-5 sm:p-6) for card body padding. `CARD.featured` for hero/featured cards (aegean border accent).
- Primary CTA: `bg-terracotta text-white rounded-lg px-8 py-3 font-semibold`
- Secondary CTA: `border-2 border-aegean text-aegean` or `border border-terracotta/80 text-terracotta` + `rounded-lg`
- Badges/tags: `rounded-md text-xs px-2.5 py-1` + semantic colors (e.g. `bg-aegean/20 text-aegean`, `bg-sand-100 text-olive/80`)

## Architecture

```
src/
├── app/
│   ├── (padded)/         # Canonical page implementations, default-locale URLs
│   │   ├── airport/  discover/  trails/  plan/  events/  book/  bookings/
│   │   ├── weather/  wine-routes/  wineries/  villages/  beaches/  nature/
│   │   ├── cycling/  regions/  guides/  search/  secrets/  team/  install/
│   │   ├── account/  login/  register/  admin/  partner/  privacy/  terms/
│   │   └── ...       # page-specific components live next to their page.tsx
│   ├── [locale]/         # Thin wrappers: re-export the (padded) page + locale metadata
│   ├── _home/            # Home sections: *-data.ts loaders + *View.tsx client leaves
│   ├── api/              # Route handlers (Zod-validated): bookings, chat, trail-reports,
│   │                     # track, health, weather, right-now, push, cron, admin, ...
│   ├── manifests/        # Locale-aware PWA manifests
│   └── page.tsx          # Home (default locale)
├── components/           # Shared UI (Nav, cards, badges, maps, HubFooter, ...)
├── data/                 # Curated content: attractions, trails, wineries, events,
│                         # regions, itinerary-templates, secret-gems, weather, ...
├── i18n/                 # next-intl routing (7 locales, `he` RTL, beta: fr/he/ro)
└── lib/                  # design-tokens, nav-links, rate-limit, site-url, SEO helpers
```

Routing: `src/app/(padded)/<route>/page.tsx` is the single implementation; `src/app/[locale]/<route>/page.tsx` re-exports it and adds locale-aware `generateMetadata`. When adding a route, create both.

## Data Models

### Attraction (`src/data/attractions.ts` — authoritative; abbreviated here)
```ts
type Attraction = {
  id: string;           // kebab-case; unique across all plan-addable places — attractions,
                        // activities, wineries, restaurants, trails, events (the allPlaces
                        // audit in data:validate enforces this; see BUG-342)
  name: string;
  region: string;       // e.g. "Ayia Napa", "Paphos"
  description: string;  // 1–2 sentences
  type: "beach" | "ancient" | "village" | "monastery" | "nature" | "winery" | "activity";
  highlights: string[]; // 3–5 short labels
  bestFor: string[];    // e.g. ["Families", "Swimming"]
  // Winter/editorial enrichment (all optional):
  winterTip?: string; bestTimeToVisit?: string; localSecret?: string;
  backstory?: string; nameEl?: string; culturalNote?: string;
  combineWith?: string[];        // related attraction/trail ids for day combos
  // Practical info (all optional):
  openingHours?: string; transport?: string; parking?: string; accessibility?: string;
  bookingUrl?: string; contactPhone?: string; shopUrl?: string;
  // Ranking/filtering (all optional):
  latitude?: number; longitude?: number;   // Right Now distance
  seasonTags?: ("winter" | "spring" | "summer" | "autumn")[];
  indoorOutdoor?: "indoor" | "outdoor" | "mixed";
  budgetLevel?: "free" | "low" | "mid" | "high";
  editorialPriority?: number;    // 1 = highest
};
```
Arrays: `beaches`, `natureSites` (includes `activityPlaces` spread from `src/data/activity-places.ts`), `ancientSites`, `villages`, `monasteries`; wineries, restaurants, trails, and events live in their own `src/data/*` files and merge in the `discover.ts` / `index.ts` aggregates.

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

## i18n (mandatory on every user-facing change)

7 locales via next-intl: `en` (base), `el`, `de`, `pl`, plus beta `fr`, `he`, `ro` (`he` is RTL). Routing in `src/i18n/routing.ts` (`localePrefix: "as-needed"` — en unprefixed); messages in `messages/{locale}.json`.

- **No hardcoded user-facing strings in components.** Server: `const t = await getTranslations("namespace")`. Client: `const t = useTranslations("namespace")`. CI runs `npm run i18n:scan --fail` and rejects violations.
- Add every new key to **all 7** `messages/*.json` files (`npm run i18n:validate` fails on missing keys; `en` is the base).
- Curated content in `src/data/` is English by design (localized via editorial maps — see `docs/I18N_GUIDE.md`); component chrome around it must use translations.
- RSC boundary rule (from `AGENTS.md`): do not pass `Link` or `t` across server/client boundaries; use `*-data.ts` loaders + `*View.tsx` client leaves as in `src/app/_home/`.

## Adding New Content

### New attraction
1. Add to the appropriate array in `src/data/attractions.ts` (`beaches`, `natureSites`, `ancientSites`, `villages`, `monasteries`) — except records with `type: "activity"`, which go in `src/data/activity-places.ts` (they join `natureSites` via a spread).
2. Use valid `type`; keep `id` kebab-case and unique across all plan-addable place data.
3. If new type, add to union and handle in `AttractionCard` typeColors.
4. Run `npm run data:validate` (unique IDs, `combineWith` references, audits).

### New page
1. Create `src/app/(padded)/[route]/page.tsx` and a thin `src/app/[locale]/[route]/page.tsx` wrapper that re-exports it with locale-aware `generateMetadata`.
2. Use `LAYOUT.safeAreaX`, `LAYOUT.pagePy` (or `pagePyDetail` for detail pages), and appropriate `LAYOUT.list` / `LAYOUT.detail` / `LAYOUT.form` width.
3. Add link to `src/lib/nav-links.ts` (`navPrimaryLinks` / `navMoreLinks`) with a `labelKey`, and add the key to the `nav` namespace in all 7 `messages/*.json`.
4. Optionally add to homepage toolkit grid.

### New component
- Use Tailwind with design tokens above.
- Prefer server components; use `"use client"` only when needed (state, onClick, usePathname).
- All user-facing strings through `useTranslations`/`getTranslations` (see i18n section).

## Quality Checklist

- [ ] New pages include `Link` back (e.g. "← Back") where appropriate
- [ ] Mobile-first: test layouts at 375px and up (chat components: test primary flows at 375px viewport)
- [ ] No hardcoded hex in JSX — use Tailwind classes
- [ ] No hardcoded user-facing strings — `npm run i18n:scan --fail` and `npm run i18n:validate` pass
- [ ] Data files export typed arrays; keep content factual for Cyprus; `npm run data:validate` passes
- [ ] Images: use gradient placeholders until real assets; path under `/public`
- [ ] Full merge gate before claiming done: see `AGENTS.md` (lint, typecheck, test, i18n, data, build)
