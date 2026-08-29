/**
 * Canonical brand palette — single source of truth for Cyprus Winter.
 * Keep `src/app/globals.css` :root in sync; guarded by brand-colors.test.ts.
 */
export const BRAND_COLORS = {
  cloud: "#faf8f5",
  sand: "#faf8f5",
  sandMid: "#f5f2ed",
  sandDark: "#eae6df",
  sand300: "#d4cfc5",
  charcoal: "#252730",
  olive: "#4a5162",
  oliveMuted: "#6b7280",
  mutedInk: "#646975",
  terracotta: "#b55738",
  terracottaMuted: "#9c4b30",
  golden: "#d4a853",
  goldenInk: "#886522",
  aegean: "#1a6b7c",
  sage: "#526c5c",
  sageMuted: "#8fa99a",
} as const;

/** CSS custom property names in globals.css :root (kebab-case). */
export const BRAND_CSS_VARS = {
  background: BRAND_COLORS.cloud,
  foreground: BRAND_COLORS.charcoal,
  terracotta: BRAND_COLORS.terracotta,
  "terracotta-muted": BRAND_COLORS.terracottaMuted,
  olive: BRAND_COLORS.olive,
  "olive-muted": BRAND_COLORS.oliveMuted,
  "muted-ink": BRAND_COLORS.mutedInk,
  golden: BRAND_COLORS.golden,
  "golden-ink": BRAND_COLORS.goldenInk,
  charcoal: BRAND_COLORS.charcoal,
  aegean: BRAND_COLORS.aegean,
  sage: BRAND_COLORS.sage,
  "sage-muted": BRAND_COLORS.sageMuted,
  cloud: BRAND_COLORS.cloud,
  sand: BRAND_COLORS.sand,
  "sand-mid": BRAND_COLORS.sandMid,
  "sand-dark": BRAND_COLORS.sandDark,
  "sand-300": BRAND_COLORS.sand300,
} as const;

/** RGB components for rgba() in CSS (terracotta primary). */
export const BRAND_RGB = {
  terracotta: "181, 87, 56",
} as const;
