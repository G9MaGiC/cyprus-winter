/**
 * Design tokens — Cyprus Winter (terracotta + aegean).
 * Primary: terracotta. Secondary: aegean. Accents: golden. Clean typography, WCAG AA contrast.
 */
export const TOKENS = {
  /** Base neutrals */
  cloud: "#fafaf9",
  sand: "#fafaf9",
  sandMid: "#f5f5f4",
  sandDark: "#e7e5e4",
  /** Text — slate tones */
  charcoal: "#1e293b",
  olive: "#334155",
  oliveMuted: "#64748b",
  /** Primary CTAs — terracotta */
  terracotta: "#E07A5F",
  terracottaMuted: "#C96F52",
  /** Accents — amber */
  golden: "#d97706",
  /** Secondary brand — dark teal */
  aegean: "#0f766e",
  /** Muted text */
  sage: "#64748b",
  sageMuted: "#94a3b8",
} as const;

/** Bottom nav (mobile) — shared values for main padding, sticky bars, footer clearance */
export const BOTTOM_NAV = {
  height: "4.5rem",
  /** For use in Tailwind: bottom-[...] or pb-[...] with env(safe-area-inset-bottom) */
  clearance: "calc(4.5rem+env(safe-area-inset-bottom))",
} as const;

/** Max-width class names for consistent page layout. */
export const LAYOUT = {
  list: "max-w-5xl",
  listNarrow: "max-w-4xl",
  /** Horizontal padding with safe area (notch devices). Use with px-6 equivalent. */
  safeAreaX: "pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))]",
  nav: "max-w-6xl",
  detail: "max-w-3xl",
  form: "max-w-2xl",
  formNarrow: "max-w-xl",
  /** Vertical padding for list/form pages — use with LAYOUT.safeAreaX */
  pagePy: "py-12 sm:py-16",
  /** Vertical padding for detail pages — tighter for content-heavy layouts */
  pagePyDetail: "py-8 sm:py-12",
  /** Sticky bar edge-to-edge: negative margin + padding for safe area. Use for sticky filter/day bars. */
  stickyBarX: "-ml-[max(1.5rem,env(safe-area-inset-left))] -mr-[max(1.5rem,env(safe-area-inset-right))] pl-[max(1.5rem,env(safe-area-inset-left))] pr-[max(1.5rem,env(safe-area-inset-right))]",
  /** Hero components that bleed to viewport edges */
  heroBleedX: "-mx-4 sm:-mx-6",
} as const;

/** Section rhythm — 2026 generous whitespace. */
export const SECTION = {
  /** Main section padding */
  py: "py-16 sm:py-24",
  /** Subsection (e.g. within a card or split layout) */
  pySub: "py-6 sm:py-8",
  /** Space between section heading and subtitle/intro */
  titleGap: "mb-2",
  /** Space between section heading and content block */
  headingGap: "mb-6 sm:mb-8",
  /** Space between major sections (list/detail pages) */
  blockGap: "space-y-16 sm:space-y-20",
  alt: "bg-sand/80",
} as const;

/** Shared CTA classes — design-token only, no hex. Used by homepage and other pages. */
export const CTA = {
  primary:
    "inline-flex items-center justify-center min-h-[48px] w-full sm:w-auto sm:min-w-[180px] px-8 py-3.5 rounded-xl bg-terracotta text-white font-semibold hover:bg-terracotta-muted transition-colors duration-200 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal",
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

/** Cards — warmth, subtle depth, less boxy. */
export const CARD = {
  base: "rounded-xl bg-white/90 border border-sand-200/80 shadow-sm",
  hover: "hover:border-terracotta/30 hover:shadow-md transition-all duration-200",
  interactive: "active:scale-[0.99] motion-reduce:active:scale-100 transition-transform",
  featured:
    "border-2 border-aegean/30 hover:border-aegean/50 hover:shadow-lg bg-gradient-to-br from-white/95 to-sand-100/70",
  link: "block transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  media: "aspect-[4/3] relative overflow-hidden bg-sand-200/50 shrink-0",
  /** Card body padding — use for content area inside cards */
  content: "p-5 sm:p-6",
  /** Content-heavy sections (code blocks, long text) */
  contentLg: "p-6 sm:p-8",
  footer: "px-5 sm:px-6 pb-5 sm:pb-6 -mt-2",
} as const;

/** Shared type ramp — reduces repeated class strings. */
export const TYPE = {
  sectionTitle: "font-display text-2xl sm:text-3xl font-semibold text-charcoal leading-tight",
  sectionSubtitle: "text-sage text-sm sm:text-base leading-relaxed",
  cardTitle: "font-display text-lg font-semibold text-olive group-hover:text-terracotta transition-colors",
  kicker: "prose-label text-sage",
  kickerOnDark: "prose-label text-white/80",
} as const;

/** Homepage hero primitives (server components compose these). */
export const HERO = {
  section:
    "relative isolate overflow-hidden min-h-[72vh] min-[400px]:min-h-[76vh] sm:min-h-[86vh] flex flex-col items-center justify-end sm:justify-center pb-16 sm:pb-24 text-center w-full",
  /** Single gradient overlay (simplified per Design review). */
  overlay:
    "absolute inset-0 pointer-events-none bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/5",
  /** List page hero image overlay — readable text on variable images. */
  listOverlay:
    "absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60 pointer-events-none",
  panel:
    "relative rounded-2xl bg-charcoal/30 backdrop-blur-md ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6 sm:p-10",
} as const;

/** Callout/tip boxes — shared styling for buffer-zone, local secret, and similar blocks. */
export const CALLOUT = {
  /** Golden tip style (local secrets, buffer zone, insider tips). */
  tip: "rounded-xl bg-golden/5 border-l-4 border-l-golden/50 border border-golden/20",
  /** Terracotta CTA-style accent (compose with CARD.base for book & contact blocks). */
  cta: "border-l-4 border-l-terracotta/40",
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
