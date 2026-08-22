/** Visit Cyprus tourist guides PDF district headers (Aug 2026). */
export const TOURIST_GUIDE_DISTRICTS = [
  "general",
  "lefkosia",
  "ammochostos",
  "larnaka",
  "lemesos",
  "pafos",
] as const;

export type TouristGuideDistrict = (typeof TOURIST_GUIDE_DISTRICTS)[number];

export const PDF_DISTRICT_TO_ID: Record<string, TouristGuideDistrict> = {
  LEFKOSIA: "lefkosia",
  AMMOCHOSTOS: "ammochostos",
  LARNAKA: "larnaka",
  LEMESOS: "lemesos",
  PAFOS: "pafos",
};

/** Map app trail regions to directory districts for deep links. */
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
