/**
 * Authoritative trail catalog tiers for gap analysis.
 * Visit Cyprus = state-forest / national-park official pages (CTO).
 * fd56 = outside state forests (moa.gov.cy HTML).
 * PDF leaflets = Forestry four-fold flyers (Troodos + Paphos indexes).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { VISITCYPRUS_SLUG_TO_TRAIL_ID } from "./visitcyprus-slug-map";
import { forestryNameToTrailId } from "./forestry-name-map";
import { pdfToTrailId, normalizePdfKey } from "./forestry-pdf-map";
import type { ForestryOutsideRecord } from "./scrape-forestry-trails";

const here = dirname(fileURLToPath(import.meta.url));

export const VISIT_CYPRUS_TRAIL_IDS = [
  ...new Set(Object.values(VISITCYPRUS_SLUG_TO_TRAIL_ID)),
] as const;

export type CatalogTier = "visit-cyprus" | "fd56-outside" | "forestry-pdf" | "discovery";

export type CatalogSnapshot = {
  visitCyprus: string[];
  fd56Outside: string[];
  forestryPdf: string[];
  authoritativeUnion: string[];
  unmappedPdfKeys: string[];
};

function loadFd56Ids(): string[] {
  const manifest = JSON.parse(
    readFileSync(join(here, "forestry-outside-manifest.json"), "utf8"),
  ) as { trails: ForestryOutsideRecord[] };
  return [
    ...new Set(
      manifest.trails.map((t) => forestryNameToTrailId(t.name)).filter((id): id is string => Boolean(id)),
    ),
  ];
}

function loadForestryPdfIds(): { mapped: string[]; unmapped: string[] } {
  const manifest = JSON.parse(
    readFileSync(join(here, "forestry-outside-manifest.json"), "utf8"),
  ) as { leaflets: { pdfs: string[] }[] };
  const seen = new Set<string>();
  const mapped = new Set<string>();
  const unmapped: string[] = [];

  for (const leaflet of manifest.leaflets) {
    for (const url of leaflet.pdfs) {
      const key = normalizePdfKey(url);
      if (seen.has(key)) continue;
      seen.add(key);
      const id = pdfToTrailId(url);
      if (id) mapped.add(id);
      else unmapped.push(key);
    }
  }

  return { mapped: [...mapped], unmapped: [...unmapped].sort() };
}

export function buildCatalogSnapshot(): CatalogSnapshot {
  const visitCyprus = [...VISIT_CYPRUS_TRAIL_IDS];
  const fd56Outside = loadFd56Ids();
  const { mapped: forestryPdf, unmapped: unmappedPdfKeys } = loadForestryPdfIds();
  const authoritativeUnion = [...new Set([...visitCyprus, ...fd56Outside, ...forestryPdf])];

  return {
    visitCyprus,
    fd56Outside,
    forestryPdf,
    authoritativeUnion,
    unmappedPdfKeys,
  };
}

export function tierForTrailId(id: string, snapshot: CatalogSnapshot): CatalogTier {
  if (snapshot.visitCyprus.includes(id)) return "visit-cyprus";
  if (snapshot.fd56Outside.includes(id)) return "fd56-outside";
  if (snapshot.forestryPdf.includes(id)) return "forestry-pdf";
  return "discovery";
}
