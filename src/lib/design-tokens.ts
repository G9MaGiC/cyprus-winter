/**
 * Design tokens — Cyprus Winter (Mediterranean warmth).
 * Primary: terracotta. Secondary: aegean. Accents: golden, sage. Fraunces + Plus Jakarta Sans.
 *
 * Brand checklist (new components): terracotta = primary CTA; aegean = secondary/contextual;
 * golden = accent on dark surfaces (nav, hero); imagery = Cyprus-specific, winter-appropriate.
 */
export const TOKENS = {
  /** Base neutrals — warm sand/cream */
  cloud: "#faf8f5",
  sand: "#faf8f5",
  sandMid: "#f5f2ed",
  sandDark: "#eae6df",
  /** Text — earthy slate */
  charcoal: "#252730",
  olive: "#4a5162",
  oliveMuted: "#6b7280",
  /** Primary CTAs — terracotta clay */
  terracotta: "#c96f52",
  terracottaMuted: "#b85d42",
  /** Accents — golden hour */
  golden: "#d4a853",
  /** Secondary brand — Aegean sea */
  aegean: "#1a6b7c",
  /** Earth accent — trails, sustainable */
  sage: "#6b8f7a",
  sageMuted: "#8fa99a",
} as const;

/** Mobile-first: 44px touch target (Apple HIG, WCAG). Use min-h-[44px], min-w-[44px]. */
export const TOUCH_TARGET = "44px";

/** Box shadow for map markers (Leaflet inline styles) — charcoal-based */
export const MAP_ICON_SHADOW = "0 2px 6px rgba(37,39,48,0.2)";
export const MAP_ICON_SHADOW_SM = "0 2px 4px rgba(37,39,48,0.2)";

/**
 * Micro-interaction timing — smooth, not rushed.
 * Tailwind mapping: duration-150 = fast, duration-200 = smooth, duration-300 = medium.
 */
export const TRANSITION = {
  fast: "150ms ease",
  smooth: "0.2s ease",
  medium: "0.3s ease",
} as const;

/** Bottom nav (mobile) — shared values for main padding, sticky bars, footer clearance */
export const BOTTOM_NAV = {
  height: "4.5rem",
  /** For use in Tailwind: bottom-[...] or pb-[...] with env(safe-area-inset-bottom) */
  clearance: "calc(4.5rem+env(safe-area-inset-bottom))",
  /** Gap between BottomNav and mobile sticky CTAs (height + gap = 5.5rem). */
  stickyGap: "1rem",
  stickyClearance: "calc(5.5rem+env(safe-area-inset-bottom))",
  stickyClearanceWithCookie:
    "calc(5.5rem+env(safe-area-inset-bottom)+var(--cw-cookie-banner-offset,0px))",
} as const;

/** Nav bar height (h-14) + safe area. Use for spacing content below fixed nav. */
export const NAV_OFFSET = "calc(3.5rem+env(safe-area-inset-top,0px))";

/**
 * Layering scale — keeps overlays/banners predictable.
 * Component mapping (prefer these over ad-hoc z-index):
 * - chrome: Nav, BottomNav (`z-40`)
 * - popover: home skip nav, menus (`z-[45]`)
 * - modal: AI assistant panel when open (`z-50`)
 * - cookieBanner: CookieConsentBanner (`z-[90]`)
 * - toast: ToastContainer (`z-[95]`)
 * - onboarding: OnboardingModal (`z-[100]`)
 * - stickyPlaceBar: StickyAddToPlanBar, TrailDetailStickyActions (`z-30`–`z-40`)
 */
export const LAYER = {
  /** Persistent chrome like `BottomNav`. */
  chrome: "z-40",
  /** Popovers/menus/tooltips above chrome, below modals. */
  popover: "z-[45]",
  /** Standard modal/dialog (e.g. AI assistant panel). */
  modal: "z-50",
  /** Reserved for future top overlays; cookie/onboarding use dedicated tokens below. */
  topOverlay: "z-[70]",
  /** Cookie consent banner — above chrome, below onboarding. */
  cookieBanner: "z-[90]",
  /** First-run onboarding sheet — top of blocking stack. */
  onboarding: "z-[100]",
  /** Toasts — above cookie banner, below onboarding. */
  toast: "z-[95]",
  /** Mobile sticky place actions below nav, above content. */
  stickyPlaceBar: "z-30",
  /** Sticky content: filter bars, day selectors, in-page sticky headers. */
  stickyContent: "z-10",
  /** Skip-to-content link — always on top. */
  skipNav: "z-[9999]",
} as const;

/** Max-width and structural layout classes. */
export const LAYOUT = {
  /** Top padding for (padded) pages — clears fixed nav. Complements NAV_OFFSET. */
  paddedTop: "pt-[calc(3.5rem+env(safe-area-inset-top,0px))]",
  /** Sticky top — for elements that stick below fixed nav. Use with sticky. */
  stickyTop: "top-[calc(3.5rem+env(safe-area-inset-top,0px))]",
  /** Sticky top (sm and up only) — for elements that stick on desktop only. */
  stickyTopSm: "sm:sticky sm:top-[calc(3.5rem+env(safe-area-inset-top,0px))]",
  /** Main content bottom padding — clears bottom nav on mobile. Complements BOTTOM_NAV. */
  mainPaddingBottom: "pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0",
  /** Fixed/sticky bottom — for elements above bottom nav. Use with fixed. */
  fixedBottomClearance: "bottom-[calc(4.5rem+env(safe-area-inset-bottom))]",
  /** Footer section bottom padding — clears bottom nav until md (matches BottomNav). */
  footerBottomClearance: "pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0",
  /** Hero content overlay top padding — clears nav with extra buffer. */
  heroContentTop: "pt-[calc(4.5rem+env(safe-area-inset-top,0px))]",
  /** Fixed bar above bottom nav — for bars that stack (e.g. trail actions). */
  fixedBottomAboveNav: "bottom-[calc(5.5rem+env(safe-area-inset-bottom))]",
  /** Fixed mobile CTA above BottomNav + cookie offset (use with md:hidden). */
  fixedBottomAboveNavCookie:
    "bottom-[calc(5.5rem+env(safe-area-inset-bottom)+var(--cw-cookie-banner-offset,0px))]",
  /** Same as fixedBottomAboveNav, but only on mobile (max-md). */
  fixedBottomAboveNavMaxMd: "max-md:bottom-[calc(5.5rem+env(safe-area-inset-bottom))]",
  /** Hide fixed mobile chrome when desktop nav replaces BottomNav. */
  mobileBottomChromeHidden: "md:hidden",
  list: "max-w-5xl",
  listNarrow: "max-w-4xl",
  /** Horizontal padding with safe area (notch devices). Use with px-6 equivalent. */
  safeAreaX: "pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))]",
  nav: "max-w-6xl",
  detail: "max-w-3xl",
  form: "max-w-2xl",
  formNarrow: "max-w-xl",
  /** Vertical padding for list/form pages — use with LAYOUT.safeAreaX */
  pagePy: "py-8 sm:py-12",
  /** Pages with hero image first: no top padding on mobile so hero sits under nav */
  pagePyHeroFirst: "pt-0 pb-8 sm:py-12",
  /** Plan page: hero-first + extra bottom clearance for mobile nav (StickyPlanBar). */
  pagePyPlan: "pt-0 pb-12 sm:pt-12 sm:pb-16",
  /** Vertical padding for detail pages — tighter for content-heavy layouts */
  pagePyDetail: "py-6 sm:py-10",
  /** Extra bottom padding on mobile for sticky Add-to-plan / trail action bars */
  detailMobileStickyClearance: "pb-24 sm:pb-12",
  /** Sticky bar edge-to-edge: negative margin + padding for safe area. Use for sticky filter/day bars. */
  stickyBarX: "-ml-[max(1.5rem,env(safe-area-inset-left))] -mr-[max(1.5rem,env(safe-area-inset-right))] pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))]",
  /** Hero components that bleed to viewport edges */
  heroBleedX: "-ml-[max(1.5rem,env(safe-area-inset-left))] -mr-[max(1.5rem,env(safe-area-inset-right))]",
} as const;

/** Strip sections (Weather, Right Now, Trail Conditions). Use sans type — not TYPE.cardTitle (display). */
export const STRIP = {
  py: "py-4 sm:py-5",
  pyCompact: "py-3 sm:py-4",
  surfaceSand: "bg-sand-100/80 border-b border-sand-200/70",
  surfaceAegean: "bg-aegean/5 border-b border-sand-200/70",
  /** Centered single-line strip link (weather). */
  linkCentered:
    "flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center min-h-[44px] py-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded-lg",
  /** Split row strip link (trail conditions). */
  linkSplit:
    "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-h-[44px] py-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded-lg",
  /** Primary stat / label — body sans, not display serif. */
  label: "text-sm sm:text-base font-semibold text-charcoal",
  /** Inline stats row: temps, counts. */
  inlineRow: "text-sm sm:text-base text-charcoal",
  inlinePrimary: "font-semibold tabular-nums",
  inlineSecondary: "text-olive/70",
  meta: "text-sm text-olive/80",
  hint: "text-sm text-sage group-hover:text-terracotta transition-colors shrink-0",
} as const;

/** Section rhythm
 * - SECTION.py: Major hub sections (home Explore, This week). Use for full-width blocks.
 * - py-12 sm:py-16: List page sections (LAYOUT.pagePy). Use for list/detail page vertical padding.
 * - headingMargin vs headingMarginLarge: Both mb-8 sm:mb-10; use headingMargin as default.
 */
export const SECTION = {
  /** Main section padding — hub pages (home, list intros) */
  py: "py-12 sm:py-20",
  /** Subsection (e.g. within a card or split layout, Place of Day, Mood, Insider Tip) */
  pySub: "py-6 sm:py-8",
  /** Space between section heading and subtitle/intro */
  titleGap: "mb-2",
  /** Space between section heading and content block */
  headingGap: "mb-4 sm:mb-6",
  /** Space between major sections (list/detail pages). Use on regions, events, and similar list pages. */
  blockGap: "space-y-12 sm:space-y-16",
  alt: "bg-sand/80",
  /** Bottom margin after page header/hero (back link + title + description) */
  headingMargin: "mb-8 sm:mb-10",
  headingMarginLarge: "mb-8 sm:mb-10",
  /** Secondary aegean link — 44px touch target. Use for inline/secondary links (see Aegean usage: links, Pair with, See also). */
  aegeanLink: "inline-flex items-center min-h-[44px] py-2 text-aegean hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 rounded",
  /** Footer-style link block (e.g. "Pair with…", "See also…") below main content */
  footerBlock: "mt-10 pt-6 border-t border-sand-200/80",
  /** Top margin for sections within a page — use for consistent block spacing */
  blockTop: "mt-10 sm:mt-12",
} as const;

/**
 * CTA Hierarchy:
 * - Primary: terracotta (Explore, Plan, Book, main actions) — primary, primaryCompact, chipPrimary
 * - Secondary on dark (hero): golden — secondary, tertiaryOnDark, ghost (white text, hover golden)
 * - Secondary on light: aegean (links) or terracotta outline — secondaryCompact, SECTION.aegeanLink, border-2 border-aegean
 */
export const CTA = {
  primary:
    "inline-flex items-center justify-center min-h-[44px] w-full sm:w-auto sm:min-w-[180px] px-8 py-3.5 rounded-xl bg-terracotta text-white font-semibold hover:bg-terracotta-muted active:scale-[0.99] transition-all duration-200 ease-out text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal touch-manipulation",
  secondary:
    "inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl border-2 border-white/80 text-white/95 font-medium hover:border-golden hover:text-golden hover:bg-white/10 transition-colors duration-200 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/50 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal",
  /** Tertiary actions on dark (hero/support links). */
  tertiaryOnDark:
    "inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-golden hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/60 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal",
  ghost:
    "text-sm text-white/90 hover:text-golden underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden/60 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal rounded min-h-[44px] px-4 inline-flex items-center",
  chipPrimary:
    "inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-full bg-terracotta text-white font-medium hover:bg-terracotta-muted shrink-0 snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  chipSecondary:
    "inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-full bg-sand-200/80 text-olive font-medium hover:bg-terracotta/10 hover:text-terracotta shrink-0 snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  chipTertiary:
    "inline-flex items-center min-h-[44px] px-4 py-2.5 rounded-full bg-sand-100 text-sage hover:bg-terracotta/10 hover:text-terracotta text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  primaryCompact:
    "inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium bg-terracotta text-white hover:bg-terracotta-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  /** Secondary CTA: terracotta border for contextual hierarchy when primary is also terracotta (e.g. error/not-found pages). Aegean variant available as border-2 border-aegean text-aegean for alternate hierarchy. */
  secondaryCompact:
    "inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium border border-terracotta/80 text-terracotta hover:bg-terracotta/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
} as const;

/** Empty-state card — use for "no results", "no items yet" blocks. */
export const EMPTY_STATE = "py-16 px-6 text-center rounded-xl bg-sand-100/80 border border-sand-200/70" as const;
/** Empty-state with dashed border — use for "add first" flows (plan empty day, no bookings). */
export const EMPTY_STATE_DASHED = "py-16 px-6 text-center rounded-xl border-2 border-dashed border-sand-200/80" as const;
/** Empty-state compact — search "no results", inline empty states. */
export const EMPTY_STATE_COMPACT = "py-6 px-6 rounded-xl bg-sand-100/80 border border-sand-200/70" as const;
/** Empty-state with larger vertical padding — e.g. trails "no results" with CTA. */
export const EMPTY_STATE_LARGE = "py-20 px-6 text-center rounded-xl bg-sand-100/80 border border-sand-200/70" as const;

/** Cards — warmth, subtle depth, Mediterranean feel. All cards use rounded-xl. */
export const CARD = {
  base: "rounded-xl bg-white/95 border border-sand-200/80 shadow-[0_2px_12px_rgba(37,39,48,0.06)]",
  hover: "hover:border-terracotta/25 hover:shadow-[0_8px_24px_rgba(37,39,48,0.1)] transition-all duration-300 ease-out",
  interactive: "active:scale-[0.99] motion-reduce:active:scale-100 transition-transform duration-150",
  /** Media cards: image-first, gradient overlay for text legibility */
  media: "aspect-[4/3] relative overflow-hidden bg-sand-200/50 shrink-0",
  /** Card image gradient — warm Mediterranean feel */
  mediaOverlay: "absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/20 to-transparent pointer-events-none",
  /** Info cards (ThisWeekGrid, StartHereWithExplore): border accent, no image. Compose with border-l-4 border-l-aegean|terracotta|golden */
  info: "rounded-xl bg-white/90 border border-sand-200/80 shadow-sm",
  /** Action cards (Plan, Events, StartHereWithExplore primary): larger padding, strong CTA */
  action: "rounded-xl bg-white/90 border border-sand-200/80 shadow-sm hover:border-terracotta/30 hover:shadow-lg transition-all duration-200",
  /** Compact cards (RightNowCard, RecentlyViewedStrip): smaller, horizontal-friendly */
  compact: "rounded-xl bg-white/90 border border-sand-200/80 shadow-sm",
  /** Featured media cards: subtle aegean border, no gradient — use with CARD.base + CARD.hover */
  featured: "border-2 border-aegean/20 hover:border-aegean/40",
  link: "block transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  /** Card body padding — use for content area inside cards */
  content: "p-5 sm:p-6",
  /** Content-heavy sections (code blocks, long text) */
  contentLg: "p-6 sm:p-8",
  /** Plan page combo cards — larger, softer */
  planCombo:
    "rounded-2xl bg-white/98 border border-sand-200/80 shadow-[0_2px_16px_rgba(37,39,48,0.06)] hover:border-terracotta/25 hover:shadow-[0_8px_28px_rgba(37,39,48,0.1)]",
  /** Plan page template cards — compact but tap-friendly */
  planTemplate:
    "rounded-2xl bg-white/98 border border-sand-200/80 shadow-[0_2px_12px_rgba(37,39,48,0.05)] hover:border-terracotta/25 hover:shadow-[0_6px_20px_rgba(37,39,48,0.08)]",
  footer: "px-5 sm:px-6 pb-5 sm:pb-6 -mt-2",
} as const;

/** Shared type ramp — reduces repeated class strings. */
export const TYPE = {
  /** Page-level h1 (PageHeader, ListPageHero) */
  pageTitle: "font-display text-3xl sm:text-4xl font-bold text-olive leading-tight break-words",
  /** Section h2 (Explore, This week, etc.) */
  sectionTitle: "font-display text-2xl sm:text-3xl font-semibold text-charcoal leading-tight",
  sectionSubtitle: "text-sage text-sm sm:text-base leading-relaxed",
  /** Card h3 titles */
  cardTitle: "font-display text-lg font-semibold text-olive group-hover:text-terracotta transition-colors",
  /** Sub-section h2 (weather conditions, plan map, day panel) — smaller than sectionTitle */
  subSectionTitle: "font-display text-xl font-semibold leading-tight",
  /** Sub-section with responsive bump */
  subSectionTitleLg: "font-display text-xl sm:text-2xl font-semibold leading-tight",
  kicker: "prose-label text-sage",
  kickerOnDark: "prose-label text-white/80",
  /** Compact card titles (RightNowCard, strip headings) */
  cardTitleCompact: "font-display text-sm sm:text-base font-semibold text-charcoal group-hover:text-terracotta transition-colors",
  /** Numeric / metric lines in info cards (weather temps, counts) — sans, not display */
  stat: "text-xl sm:text-2xl font-semibold text-charcoal tabular-nums tracking-tight",
  statSub: "text-sm text-sage",
} as const;

/** Floated band below hero (trip mode chips). */
export const POST_HERO = {
  wrap: `${LAYOUT.safeAreaX} relative z-20 -mt-8 sm:-mt-10`,
  inner: `${LAYOUT.list} mx-auto`,
  panel:
    "rounded-2xl border border-sand-200/80 bg-background shadow-[0_4px_20px_rgba(37,39,48,0.06)] px-3 py-3 sm:px-4",
  chipNav: "flex flex-wrap items-center justify-center gap-2",
} as const;

/** Homepage hero primitives (server components compose these). */
export const HERO = {
  /** Shorter on mobile for faster discovery; taller on desktop for impact */
  section:
    "relative isolate overflow-hidden min-h-[68vh] min-[400px]:min-h-[72vh] sm:min-h-[84vh] flex flex-col items-center justify-end sm:justify-center pb-14 sm:pb-20 text-center w-full",
  /** Simplified overlay — legibility without muddying the image */
  overlay:
    "absolute inset-0 pointer-events-none bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/5",
  /** List page hero — readable text on variable images */
  listOverlay:
    "absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/55 pointer-events-none",
  /** Panel — frosted glass over hero, Mediterranean warmth */
  panel:
    "relative rounded-2xl bg-charcoal/40 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6 sm:p-10 lg:p-12 transition-shadow duration-300",
} as const;

/** Callout/tip boxes — shared styling for buffer-zone, local secret, and similar blocks. */
export const CALLOUT = {
  /** Golden tip style (local secrets, buffer zone, insider tips). */
  tip: "rounded-xl bg-golden/5 border-l-4 border-l-golden/50 border border-golden/20",
  /** Terracotta CTA-style accent (compose with CARD.base for book & contact blocks). */
  cta: "border-l-4 border-l-terracotta/40",
} as const;

/** Skeleton loading — pulse + palette. Compose with h-* w-* for dimensions. */
export const SKELETON = {
  bar: "animate-pulse rounded bg-olive/30",
  block: "animate-pulse rounded-lg bg-sand-300/60",
  media: "aspect-[4/3] bg-sand-300/60 animate-pulse",
  card: "rounded-xl bg-white/90 border border-sand-200/80",
} as const;

/** Pill/puck UI (chips, category rails, compact CTAs). */
export const PILL = {
  base:
    "inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  neutral:
    "bg-sand-200/80 text-olive hover:bg-terracotta/10 hover:text-terracotta shrink-0 snap-start active:scale-[0.98] motion-reduce:active:scale-100 border border-sand-200/80 hover:border-terracotta/30",
  subtle:
    "bg-sand-100 text-sage hover:bg-terracotta/10 hover:text-terracotta text-sm active:scale-[0.98] motion-reduce:active:scale-100 border border-sand-200/70 hover:border-terracotta/30",
  active: "bg-terracotta text-white border border-terracotta/30 shadow-sm",
} as const;
