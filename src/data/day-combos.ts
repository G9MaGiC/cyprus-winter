/**
 * Curated day combos for Build a day + Discover teaser.
 * Copy lives in messages `plan.dayCombos.*` (i18n).
 */

export type DayComboKey =
  | "trailAndVillage"
  | "limassolCoastCommandaria"
  | "paphosMosaicsWine"
  | "waterfallVillage"
  | "kykkosWine"
  | "laceAncientWine"
  | "gentleTrailPlatres"
  | "paphosCoastAdonis";

export type DayComboDef = {
  key: DayComboKey;
  ids: string[];
};

export const DAY_COMBO_DEFS: DayComboDef[] = [
  { key: "trailAndVillage", ids: ["artemis", "omodos", "tsiakkas"] },
  { key: "limassolCoastCommandaria", ids: ["kourion", "governors-beach", "kolossi"] },
  { key: "paphosMosaicsWine", ids: ["pafos-mosaics", "tomb-of-kings", "vouni-panayia"] },
  { key: "waterfallVillage", ids: ["caledonia-falls", "kakopetria"] },
  { key: "kykkosWine", ids: ["kykkos", "tsiakkas"] },
  { key: "laceAncientWine", ids: ["lefkara", "choirokoitia", "domes-sergiou"] },
  { key: "gentleTrailPlatres", ids: ["atalante", "platres"] },
  { key: "paphosCoastAdonis", ids: ["tomb-of-kings", "adonis", "kolios"] },
];
