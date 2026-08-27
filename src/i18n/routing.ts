/** Locale routing. URL/locale policy: docs/INTERNATIONAL_SEO.md */
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "el", "de", "pl", "ro", "fr", "he"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

/** Locales still labeled beta in the switcher until lawyer sign-off on privacy/terms.
 *  Chrome/editorial/legal drafts shipped (PRs #179–#183). Graduation: docs/BETA_LOCALE_GRADUATION.md */
export const BETA_LOCALES = ["fr", "he", "ro"] as const satisfies readonly Locale[];

export function isBetaLocale(locale: string): locale is (typeof BETA_LOCALES)[number] {
  return (BETA_LOCALES as readonly string[]).includes(locale);
}
