# UX patterns — Cyprus Winter

Contract for hub/detail footers, sticky bars, overlays, and CTAs. Aligns with [`.cursor/UX_PERSONA.md`](../.cursor/UX_PERSONA.md) and [`src/lib/design-tokens.ts`](../src/lib/design-tokens.ts).

## Hub footer (`HubFooter`)

Use on list/hub pages:

- Discover index (`DiscoverFooter`)
- Trails index (`TrailsFooter`)
- Beaches, Villages, Wineries (`WineriesHubFooter`), Secrets, Nature, Cycling
- Events, Search, Airport, Weather (`WeatherHubFooter`), Weather month (`WeatherMonthFooter`)
- Book guide (`BookGuideHubFooter`), Book winery (`BookWineryHubFooter`)
- Guides directory (`GuidesDirectoryFooter`), Troodos December (`TroodosDecemberFooter`)
- Regions (`/regions/[slug]`), Wine routes hub + slug (`/wine-routes`, `/wine-routes/[slug]`)

- **Primary:** Plan (`/plan`) — `CTA.primaryCompact`
- **Secondary:** Ask AI — `triggerAIAssistant()`; disabled when blocking overlays active; `CTA.secondaryCompact`
- **Optional:** `onScrollToMap`, `secondary` slot via `HubFooterSecondaryLinks` (flex-wrap links, not inline `·` separators)
- **Body:** page-specific copy (i18n)
- **Sticky:** `StickyPlanBarBlock` with a page-specific sentinel id (trip-level, not per-card)
- **Analytics:** `hub_footer_click` with `action` (`plan` | `ask_ai`) and `page` (pathname or `analyticsPage` prop). First-party via `trackProduct` (no marketing-cookie consent).

Do **not** add `LAYOUT.footerBottomClearance` on `HubFooter` — `<main>` already uses `LAYOUT.mainPaddingBottom`.

## Detail footer (`DetailActionFooter`)

Use on place/trail detail pages after main content.

- **Add to plan** — `AddToItineraryButton` (`plan_add`, `source: detail_footer`)
- **Navigate** — when place has coordinates
- **Ask AI** — same event as hub footer (`hub_footer_click`, `action: ask_ai`)
- **Book:** keep in-content booking blocks; do not duplicate in footer if already above fold

**Sticky (mobile):** `StickyAddToPlanBar` or `TrailDetailStickyActions` when footer sentinel scrolls out. Hide sticky when site footer sentinel (`FOOTER_SENTINEL_ID`) is in view.

## Sticky bar rules

| Page type | Component | When visible |
|-----------|-----------|--------------|
| Hub/list | `StickyPlanBarBlock` | Plan sentinel leaves viewport |
| Discover detail | `StickyAddToPlanBar` | Add sentinel out of view AND footer not in view |
| Trail detail | `TrailDetailStickyActions` | Same as discover detail |

Never stack duplicate CTAs: sticky hides when footer actions are visible.

## Overlay sequence (first visit)

1. **Cookie** — `CookieConsentBanner`, blocking while visible (`data-overlay-active="true"`).
2. **Onboarding** — after `window` `load` + dynamic import; blocking only when panel is **visible** (not during 2s delay).
3. **AI** — enabled when no blocking overlay has `data-overlay-active="true"` (`useBlockingOverlaysActive`).

Deep links (`/plan?template=`, `/book/`) may skip onboarding (see `OnboardingModal`).

Hidden onboarding: `pointer-events-none`, `aria-hidden`, not in tab order.

## CTA matrix

| Token | Use |
|-------|-----|
| `CTA.primary` / `primaryCompact` | One main action per block (Explore, Plan, Book, Add to plan) |
| `CTA.secondary` / `secondaryCompact` | Second action on light surfaces; Ask AI on footers |
| `CTA.tertiaryOnDark` / `ghost` | Hero support links on dark imagery |
| `CTA.chipTertiary` | Filter chips, low-priority browse links in empty states |
| `SECTION.aegeanLink` | Inline text links in footers and copy |

## Voice glossary (UI)

- **Plan** — not “itinerary” in user-facing UI
- **Cyprus Guide** — AI panel title (`common.ai.title`)
- **Ask your guide** — hero visible label; nav uses `nav.askAI` / `nav.askAIAria`
- **Verified partner** — winery badge; explain once on team/about if needed

## Z-index (`LAYER`)

See comments in `design-tokens.ts`. Cookie and onboarding sit above chrome; AI panel uses `LAYER.modal` when open. `LAYER.toast` (`z-[95]`) hosts transient banners (InstallPromptBanner); there is no toast *component* system — action feedback is inline on the triggering control (see PlanShareBar) plus an `SRStatus` announcement.

## Mobile bottom chrome (all viewports)

**Breakpoint alignment:** BottomNav hides at `md` (768px). Use the same breakpoint for:

| Token / class | Purpose |
|---------------|---------|
| `LAYOUT.mainPaddingBottom` | On `<main>` — clears BottomNav until `md`; hub footers omit extra `footerBottomClearance` to avoid double gap |
| `LAYOUT.fixedBottomAboveNavCookie` | Fixed sticky CTAs sit **above** nav + cookie offset (5.5rem) |
| `LAYOUT.mobileBottomChromeHidden` | `md:hidden` on mobile-only fixed bars |

Do **not** use `sm:pb-0` or `sm:hidden` for bottom chrome unless the element is intentionally tablet-only.

**Stacking:** Sticky place bars use `LAYER.stickyPlaceBar` (`z-30`). BottomNav is `z-40`. Trip summary chip uses `LAYER.popover` (`z-45`). Hide floating chips when `useBlockingOverlaysActive()` is true.

**Tablet gap (640–767px):** Avoid hiding mobile sticky bars at `sm` while BottomNav remains until `md`. Home category chips use `md:flex-wrap` for the same reason.

## Motion and micro-interaction

See [`docs/MOTION.md`](./MOTION.md) and [`docs/DESIGN_SUPER_BRIEF.md`](./DESIGN_SUPER_BRIEF.md).

| Pattern | Token / class | Use |
|---------|---------------|-----|
| Button press | `CTA.primary` `active:scale-[0.99]` | Primary actions |
| Card hover | `CARD.hover` | Desktop discover/plan cards |
| Sticky filter bar | `STRIP.stickySandBar` | Discover, trails, events, plan day selector |
| Sticky bottom add | `STRIP.stickyBottomBar` | Plan/trail sticky CTAs |
| Section reveal | `.section-reveal` | First paint only; stagger ≤80ms; max 3 on home |
| AI panel | `.ai-chat-panel-enter` | Panel open |
| Reduced motion | `globals.css` + `motion-reduce:` | Required for all new animation |

Do not add motion that blocks overlay precedence (cookie → onboarding → AI).

## E2E coverage

CI gate `npm run test:e2e:gate:ci` runs:

- Core funnel: arrival, discover-plan, plan-book, bookings, locale routes (desktop + mobile-chrome)
- UX: `hub-footer`, `overlay-precedence`, `discover-detail`
