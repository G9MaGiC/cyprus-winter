/** Shared types for licensed tourist guides directory (Visit Cyprus PDF). */
export const TOURIST_GUIDE_DISTRICTS = [
  "general",
  "lefkosia",
  "ammochostos",
  "larnaka",
  "lemesos",
  "pafos",
] as const;

export type TouristGuideDistrict = (typeof TOURIST_GUIDE_DISTRICTS)[number];

export const LOCALE_TO_GUIDE_LANGUAGE: Record<string, string> = {
  en: "english",
  el: "greek",
  de: "german",
  pl: "polish",
  ro: "romanian",
  fr: "french",
  he: "hebrew",
};

export const TRAIL_REGION_TO_DISTRICT: Record<string, TouristGuideDistrict> = {
  Troodos: "lemesos",
  Paphos: "pafos",
  "Paphos & Akamas": "pafos",
  Limassol: "lemesos",
  Larnaca: "larnaka",
  Nicosia: "lefkosia",
  Famagusta: "ammochostos",
  "Ayia Napa": "ammochostos",
};
