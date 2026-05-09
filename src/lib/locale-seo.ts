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

export function buildPathAlternates(
  path: string,
  activeLocale: string
): NonNullable<Metadata["alternates"]> {
  return {
    canonical: absoluteUrlForLocale(path, activeLocale),
    languages: alternateLanguageUrls(path),
  };
}

/**
 * Set canonical, hreflang, and openGraph.url for a segment (default or locale-prefixed).
 */
export function applyLocaleToMetadata(
  base: Metadata,
  pathWithoutLocale: string,
  locale: string
): Metadata {
  const canonical = absoluteUrlForLocale(pathWithoutLocale, locale);
  const languages = alternateLanguageUrls(pathWithoutLocale);
  return {
    ...base,
    alternates: {
      ...base.alternates,
      canonical,
      languages,
    },
    openGraph: base.openGraph
      ? { ...base.openGraph, url: canonical }
      : undefined,
  };
}
