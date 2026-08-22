/** Visit Cyprus nature “Sites of Interest” (excursions) metadata. */
export const NATURE_EXCURSION_REGIONS = [
  "lefkosia",
  "lemesos",
  "larnaka",
  "pafos",
  "ammochostos",
  "troodos",
] as const;

export type NatureExcursionRegion = (typeof NATURE_EXCURSION_REGIONS)[number];

export type NatureExcursionKind =
  | "visitor_centre"
  | "wetland"
  | "forest_park"
  | "valley"
  | "botanic";

export type NatureExcursion = {
  id: string;
  name: string;
  region: NatureExcursionRegion;
  kind: NatureExcursionKind;
  description: string;
  winterNote?: string;
  visitCyprusUrl: string;
  /** Cross-link to curated discover/trail id when we have one. */
  relatedPlaceId?: string;
  relatedTrailId?: string;
  winterPick?: boolean;
};

export const VC_EXCURSIONS_INDEX_URL =
  "https://www.visitcyprus.com/discover-cyprus/nature/excursions/" as const;

export const NATURE_PARTNER_LINKS = {
  birdLifeCyprus: "https://www.birdlifecyprus.org/",
  cyprusRocks: "https://www.cyprusrocks.eu/",
  visitCyprusClimbing: "https://www.visitcyprus.com/discover-cyprus/nature/climbing/",
  visitCyprusBirdwatching: "https://www.visitcyprus.com/discover-cyprus/nature/birdwatching/",
  visitCyprusTrails: "https://www.visitcyprus.com/discover-cyprus/nature/nature-trails-2/",
} as const;
