import type { Locale } from "@/i18n/routing";

/**
 * Official government travel pages for Cyprus, one per locale (AUD-25).
 * Each locale links its own authority. Greece publishes no per-country
 * advisories, so el links the Greek MFA's Cyprus mission page instead.
 */
export const ADVISORY_LINKS: Record<Locale, string> = {
  en: "https://www.gov.uk/foreign-travel-advice/cyprus",
  el: "https://www.mfa.gr/cyprus/",
  de: "https://www.auswaertiges-amt.de/de/service/laender/zypern-node/zypernsicherheit-210258",
  pl: "https://www.gov.pl/web/dyplomacja/cypr",
  ro: "https://www.mae.ro/travel-conditions/3682",
  fr: "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/chypre/",
  he: "https://www.gov.il/he/pages/cyprus1",
};

export function advisoryLinkForLocale(locale: string): string {
  return Object.hasOwn(ADVISORY_LINKS, locale)
    ? ADVISORY_LINKS[locale as Locale]
    : ADVISORY_LINKS.en;
}
