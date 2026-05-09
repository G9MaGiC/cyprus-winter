import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-url";

const { defaultLocale, locales } = routing;

/**
 * Pathname without locale prefix (e.g. `/discover`, `/trails/12`). Use `"/"` for home.
 * Aligns with next-intl `localePrefix: "as-needed"`: default locale has no prefix in the URL.
 */
export function localizedPathname(path: string, locale: string): string {
  const normalized = path === "/" || path === "" ? "" : path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) {
    return normalized === "" ? "/" : normalized;
  }
  return `/${locale}${normalized}`;
}

export function absoluteLocalizedUrl(path: string, locale: string): string {
  return `${SITE_URL}${localizedPathname(path, locale)}`;
}

/**
 * Strategy A: one canonical (default locale / unprefixed) plus full hreflang and x-default.
 */
export function buildStrategyAAlternates(path: string): {
  canonical: string;
  languages: Record<string, string>;
} {
  const p = path === "" ? "/" : path.startsWith("/") ? path : `/${path}`;
  const canonical = absoluteLocalizedUrl(p, defaultLocale);
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = absoluteLocalizedUrl(p, loc);
  }
  languages["x-default"] = canonical;
  return { canonical, languages };
}
