/**
 * Coverage registry for the secret-gem overlay (AUD-10, final content
 * class). Shared by the server overlay and its guard test so the covered
 * set has one definition; extended slice by slice like the winery,
 * attraction and trail registries before it.
 */

export const LOCALIZED_SECRET_GEM_FIELDS = ["title", "body"] as const;
export type LocalizedSecretGemField = (typeof LOCALIZED_SECRET_GEM_FIELDS)[number];

export const LOCALIZED_SECRET_GEM_IDS: ReadonlySet<string> = new Set([
  // Slice 1 (batch 52): gems attached to flagship template/discover places.
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
  // Slice 2 (batch 53): next 22 in data order.
  "zambartas-aes-ambelis",
  "bellapais-tree",
  "louvaras-before-omodos",
  "leventis-first",
  "ledra-buffer-zone",
  "kouklia-cafe",
  "adonis-polis-loop",
  "st-hilarion-window",
  "kolossi-sugar-mill",
  "governors-coves",
  "choirokoitia-mist",
  "fikardou-square",
  "kyperounta-fire-tower",
  "rainy-nicosia",
  "lofou-before-omodos",
  "zygi-fish-tavernas",
  "laiki-geitonia-market",
  "vavla-quiet-escape",
  "foini-potters",
  "kritou-terra-akamas",
  "kormakitis-maronite",
  "statos-village-wine",
]);
