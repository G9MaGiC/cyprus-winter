import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-url";

/**
 * Path without locale prefix, e.g. "" (home), "/discover", "/trails/abc".
 * next-intl uses `localePrefix: "as-needed"`: default locale has no /en prefix.
 */
function normalizePath(path: string): string {
  if (!path || path === "/") return "";
  return path.startsWith("/") ? path : `/${path}`;
}

/** Public URL for a path under a locale (default locale omits prefix). */
export function absoluteUrlForLocale(path: string, locale: string): string {
  const suffix = normalizePath(path);
  if (locale === routing.defaultLocale) {
    return suffix === "" ? SITE_URL : `${SITE_URL}${suffix}`;
  }
  return `${SITE_URL}/${locale}${suffix}`;
}

/**
 * hreflang / x-default map for a path. Keys: locale codes + "x-default".
 */
export function alternateLanguageUrls(path: string): Record<string, string> {
  const suffix = normalizePath(path);
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = absoluteUrlForLocale(suffix, loc);
  }
  languages["x-default"] = absoluteUrlForLocale(suffix, routing.defaultLocale);
  return languages;
}

export function buildPathAlternates(path: string): NonNullable<Metadata["alternates"]> {
  return {
    // Strategy A (docs/INTERNATIONAL_SEO.md): ONE canonical — the unprefixed
    // default-locale URL — for every locale variant; locale URLs live in
    // hreflang only. Self-canonicalizing locale pages were the Strategy-B
    // half of the split-brain (AUD-117).
    canonical: absoluteUrlForLocale(path, routing.defaultLocale),
    languages: alternateLanguageUrls(path),
  };
}

/**
 * og:locale wants territory-qualified codes (bare "he" is invalid to
 * Facebook's parser; AUD-122). en_GB matches the primary UK market.
 */
const OG_LOCALES: Record<string, string> = {
  en: "en_GB",
  el: "el_GR",
  de: "de_DE",
  pl: "pl_PL",
  fr: "fr_FR",
  he: "he_IL",
  ro: "ro_RO",
};

export function ogLocaleFor(locale: string): string {
  return OG_LOCALES[locale] ?? locale;
}

/**
 * Set canonical, hreflang, openGraph.url and og:locale for a segment
 * (default or locale-prefixed). Canonical + og:url follow Strategy A —
 * the unprefixed default-locale URL, matching `buildStrategyAAlternates`.
 */
export function applyLocaleToMetadata(
  base: Metadata,
  pathWithoutLocale: string,
  locale: string
): Metadata {
  const canonical = absoluteUrlForLocale(pathWithoutLocale, routing.defaultLocale);
  const languages = alternateLanguageUrls(pathWithoutLocale);
  return {
    ...base,
    alternates: {
      ...base.alternates,
      canonical,
      languages,
    },
    openGraph: base.openGraph
      ? { locale: ogLocaleFor(locale), ...base.openGraph, url: canonical }
      : undefined,
  };
}
