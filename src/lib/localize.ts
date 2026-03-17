/**
 * Localization helpers for place names and content.
 * Data has nameEl for Greek; other locales use English name.
 */

export type SupportedLocale = "en" | "el" | "de" | "pl";

export interface WithName {
  name: string;
  nameEl?: string;
  nameDe?: string;
  namePl?: string;
}

/**
 * Returns the localized name for a place when available.
 * Falls back to `name` (English) when no locale-specific name exists.
 */
export function getLocalizedName(
  place: WithName,
  locale: string
): string {
  if (locale === "el" && place.nameEl) return place.nameEl;
  if (locale === "de" && place.nameDe) return place.nameDe;
  if (locale === "pl" && place.namePl) return place.namePl;
  return place.name;
}
