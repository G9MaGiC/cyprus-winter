/**
 * Maps Forestry Department fd56 outside-forest trail names → app trail ids.
 * Source: moa.gov.cy/moa/fd/fd.nsf/fd56_en/fd56_en?OpenDocument
 */
import { normalizeForestryName } from "./forestry-parse-utils";

/** Normalized forestry name → existing or planned trail id. */
export const FORESTRY_NAME_TO_TRAIL_ID: Record<string, string> = {
  "AGIASMA TRAIL": "agiasma",
  "ARNIES TRAIL": "arnies",
  "VOUNI TRAIL": "vouni-panagias",
  "TREIS ELIES TRAIL": "treis-elies",
  "LEMITHOU COMMUNITY TRAIL": "lemithou",
  "MILLOMERI WATERFALL TRAIL": "millomeris-falls",
  "KASTROVOUNOS TRAIL": "kastrovounos",
  "DYMES-PELENDRI TRAIL": "dymes-pelendri",
  "ARSOS TRAIL": "arsos",
  "KALEVOUNARI TRAIL": "kalevounari",
  "GERMASOGEIA WEIR TRAIL": "germasogeia-weir",
  "AGROS-KATO MYLOS TRAIL": "agros-kato-mylos",
  "ARIADNE TRAIL": "ariadni",
  "KALOPANAYIOTIS-OIKOS TRAIL": "kalopanagiotis-oikos",
  "KALOPANAYIOTIs-OIKOs TRAIL": "kalopanagiotis-oikos",
  "ARCHANGELOS - MYLOS TIS RODOUS TRAIL": "archangelos-mylos-rodous",
  "LAGOUDERA - AGROS TRAIL": "lagoudera-agros",
  "LAGOUDERA/AGROS- MADARI TRAIL": "lagoudera-madari",
  "POLYSTYPOS HAZELNUT FOREST TRAIL": "polystypos-hazelnut",
  "POLYSTYPOs hazelNUT forest trail": "polystypos-hazelnut",
  "PANO AMBELIA TRAIL": "pano-ambelia",
  "PETROS VANEZIS TRAIL": "petros-vanezis",
  "GOURRI TRAIL": "gourri",
  "ΜACHAIRAS-LAZANIAS TRAIL": "machairas-lazanias",
  "MACHAIRAS-LAZANIAS TRAIL": "machairas-lazanias",
  "LAZANIAS-FIKAROU TRAIL": "lazanias-fikardou",
  "FIKARDOU-ARCHONTIDES CENTER": "fikardou-archontides",
  "CHOIROKOITIA TRAIL": "choirokoitia-trail",
  "PANAGIA TIS AGAPIS-VAVLA TRAIL": "panagia-agapis-vavla",
  "LEFKARA TRAIL-KATO DRYS": "lefkara-path",
  "LEFKARA-METAMORFOSEOS TOU SOTIROS CHURCH TRAIL": "lefkara-metamorfoseos",
  "PROFITIS ILIAS-KONNOI TRAIL": "profitis-ilias-konnoi",
  "PANAGIA-AGIOS IOANNIS TRAIL": "panagia-agios-ioannis",
  "PANAGIA-AGIOI SARANDA": "panagia-agioi-saranda",
};

export function forestryNameToTrailId(name: string): string | null {
  const key = normalizeForestryName(name);
  return FORESTRY_NAME_TO_TRAIL_ID[key] ?? null;
}

/** Suggested ids for fd56 trails not yet in src/data/trails.ts (Aug 2026). */
export const FORESTRY_TRAILS_TO_ADD = [
  "agiasma",
  "arnies",
  "treis-elies",
  "lemithou",
  "kastrovounos",
  "dymes-pelendri",
  "arsos",
  "kalevounari",
  "germasogeia-weir",
  "agros-kato-mylos",
  "kalopanagiotis-oikos",
  "archangelos-mylos-rodous",
  "lagoudera-agros",
  "lagoudera-madari",
  "polystypos-hazelnut",
  "pano-ambelia",
  "petros-vanezis",
  "gourri",
  "machairas-lazanias",
  "lazanias-fikardou",
  "fikardou-archontides",
  "choirokoitia-trail",
  "panagia-agapis-vavla",
  "lefkara-metamorfoseos",
  "profitis-ilias-konnoi",
  "panagia-agios-ioannis",
  "panagia-agioi-saranda",
] as const;
