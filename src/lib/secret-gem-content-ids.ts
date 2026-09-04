/**
 * Coverage registry for the secret-gem overlay (AUD-10, final content
 * class). Shared by the server overlay and its guard test so the covered
 * set has one definition; extended slice by slice like the winery,
 * attraction and trail registries before it.
 */

export const LOCALIZED_SECRET_GEM_FIELDS = ["title", "body"] as const;
export type LocalizedSecretGemField = (typeof LOCALIZED_SECRET_GEM_FIELDS)[number];

/** Slice 1 (batch 52): gems attached to flagship template/discover places. */
export const LOCALIZED_SECRET_GEM_IDS: ReadonlySet<string> = new Set([
  "kourion-bench",
  "omodos-blue-door",
  "pafos-far-cafe",
  "artemis-psilo-dendro",
  "lefkara-kato",
  "nissi-winter-coffee",
  "kalopanagiotis-springs",
  "avakas-post-hike",
  "lara-picnic",
  "marina-far-end",
  "sea-caves-afternoon",
  "tomb-of-kings-light",
  "millomeris-platres",
]);
