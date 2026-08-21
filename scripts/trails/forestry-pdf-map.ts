/**
 * Map Forestry leaflet PDF filenames → app trail ids.
 * Source: forestry-outside-manifest.json leaflets (Troodos + Paphos indexes).
 */
export const FORESTRY_PDF_TO_TRAIL_ID: Record<string, string> = {
  "artemis trail en 2025.pdf": "artemis",
  "artemis trail  en 2025.pdf": "artemis",
  "atalanti trail en 2025.pdf": "atalante",
  "persephone trail en 2025.pdf": "persephone",
  "kalidonia en 2025.pdf": "caledonia-falls",
  "choirteri nature trail - four fold flyer.pdf": "chorteri",
  "chorteri nature trail - four fold flyer.pdf": "chorteri",
  "smigies nature trail - four fold flyer.pdf": "smigies",
  "adonis and aphrodite nature trails - four fold flyer.pdf": "adonis",
  "the loumata ton aeton nature trail - four fold flyer.pdf": "loumata-ton-aeton",
  "the moni - fylagra nature trail - four fold flyer.pdf": "moni-fylagra",
  "nature trail agia eirini - limeria eoka - four fold flyer.pdf": "agia-irini",
  "nature trail stavros tou agiasmati -panagia tou araka four fold flyer.pdf": "panagia-araka-stavros",
  "circular nature trail  kyparissia - four fold flyer.pdf": "germasogeia-kyparissia",
  "argakas dam nature trail - four fold flyer.pdf": "argakas-dam",
  "nature trail venetian bridges  - four fold flyer.pdf": "venetian-bridges",
  "nature trail venetian bridges - four fold flyer.pdf": "venetian-bridges",
  "nature trail symvoulas - four fold flyer.pdf": "symvoulas",
};

/** Normalize PDF URL or filename for lookup. */
export function normalizePdfKey(urlOrName: string): string {
  const name = decodeURIComponent(urlOrName.split("/").pop()?.split("?")[0] ?? urlOrName)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  return name;
}

export function pdfToTrailId(urlOrFilename: string): string | null {
  const key = normalizePdfKey(urlOrFilename);
  if (FORESTRY_PDF_TO_TRAIL_ID[key]) return FORESTRY_PDF_TO_TRAIL_ID[key];
  if (key.includes("chorteri") || key.includes("choirteri")) return "chorteri";
  if (key.includes("adonis") && key.includes("aphrodite")) return "adonis";
  return null;
}

/** Trail ids referenced in PDF map but not yet in catalog. */
export const FORESTRY_PDF_UNMAPPED_TRAIL_IDS = [] as const;
