/**
 * Generate TypeScript trail entries from forestry-outside-manifest.json (missing ids only).
 *   npx tsx scripts/trails/generate-forestry-trail-entries.ts > /tmp/forestry-trails.ts
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { trails } from "../../src/data/trails";
import { forestryNameToTrailId } from "./forestry-name-map";
import { gradeToDifficulty, forestryRouteToApp } from "./forestry-parse-utils";
import type { ForestryOutsideRecord } from "./scrape-forestry-trails";

const here = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(
  readFileSync(join(here, "forestry-outside-manifest.json"), "utf8"),
) as { trails: ForestryOutsideRecord[] };

const appIds = new Set(trails.map((t) => t.id));

const COMBINE: Record<string, string[]> = {
  agiasma: ["polis", "chrysorrogiatissa", "adonis"],
  arnies: ["chrysorrogiatissa", "vouni-panagias", "pafos-mosaics"],
  "treis-elies": ["omodos", "platres", "kakopetria"],
  lemithou: ["treis-elies", "omodos", "platres"],
  kastrovounos: ["platres", "millomeris-falls", "caledonia-falls"],
  "dymes-pelendri": ["omodos", "tsiakkas", "pelendri"],
  arsos: ["omodos", "koilani", "panagia-tis-amasgou"],
  kalevounari: ["limassol-marina", "germasogeia-weir", "omodos"],
  "germasogeia-weir": ["germasogeia-kyparissia", "kalevounari", "limassol-marina"],
  "agros-kato-mylos": ["agros", "machairas", "potamia-dam"],
  "kalopanagiotis-oikos": ["kalopanagiotis", "kykkos", "pedoulas"],
  "archangelos-mylos-rodous": ["kalopanagiotis", "kykkos", "pedoulas"],
  "lagoudera-agros": ["agros", "panagia-araka-stavros", "madari-ridge"],
  "lagoudera-madari": ["madari-ridge", "panagia-araka-stavros", "agros"],
  "polystypos-hazelnut": ["kakopetria", "platres", "kykkos"],
  "pano-ambelia": ["kakopetria", "platres", "kykkos"],
  "petros-vanezis": ["kakopetria", "platres", "kykkos"],
  gourri: ["kakopetria", "platres", "xyliatos-dam"],
  "machairas-lazanias": ["machairas", "politiko-machairas", "fikardou"],
  "lazanias-fikardou": ["fikardou", "machairas", "politiko-machairas"],
  "fikardou-archontides": ["fikardou", "machairas", "lazanias-fikardou"],
  "choirokoitia-trail": ["choirokoitia", "lefkara", "zygi-tavernas"],
  "panagia-agapis-vavla": ["vavla", "lefkara", "choirokoitia"],
  "lefkara-metamorfoseos": ["lefkara", "lefkara-kato", "choirokoitia"],
  "profitis-ilias-konnoi": ["konnos-bay", "cape-greco", "agioi-anargyroi-circular"],
  "panagia-agios-ioannis": ["konnos-bay", "cape-greco", "profitis-ilias-konnoi"],
  "panagia-agioi-saranda": ["konnos-bay", "cape-greco", "agioi-anargyroi-circular"],
};

function titleCase(name: string): string {
  const cleaned = name
    .replace(/\s*TRAIL\s*$/i, "")
    .replace(/\s*\((CIRCULAR|LINEAR)\)\s*$/i, "")
    .trim();
  return cleaned
    .split(/[\s–-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .replace(/\bOikos\b/i, "Oikos")
    .replace(/\bAgios\b/gi, "Agios")
    .replace(/\bPanagia\b/gi, "Panagia")
    .concat(" Trail");
}

function slugFromId(id: string): string {
  return `${id}-trail`.replace(/-trail-trail$/, "-trail");
}

function estimateElevation(lengthKm: number, grade: string | undefined): number {
  const g = grade?.match(/\d/)?.[0];
  if (g === "1") return Math.round(lengthKm * 30);
  if (g === "3") return Math.round(lengthKm * 80);
  return Math.round(lengthKm * 50);
}

function highlightsFromPoi(poi?: string): string[] {
  if (!poi) return ["Scenic route"];
  const bits = poi.split(/[.;]/).map((s) => s.trim()).filter(Boolean);
  return bits.slice(0, 3).map((s) => (s.length > 48 ? `${s.slice(0, 45)}…` : s));
}

function winterNote(region: string | null, grade: string | undefined): string {
  const g = grade?.match(/\d/)?.[0];
  if (region === "Famagusta") return "Mild coastal winter walk. Year-round sunshine.";
  if (region === "Paphos") return "Mild Paphos hills. Can be muddy after rain.";
  if (g === "3") return "Grade 3—steep sections. Winter is cooler and quieter.";
  return "Official outside-forest trail. Winter is a good season—cooler and quieter.";
}

for (const ft of manifest.trails) {
  const id = forestryNameToTrailId(ft.name);
  if (!id || appIds.has(id)) continue;

  const lengthKm = ft.lengthKm ?? (ft.durationMin ? Math.max(1, (ft.durationMin / 60) * 2) : 2);
  const durationMin = ft.durationMin ?? Math.round(lengthKm * 25);
  const difficulty = gradeToDifficulty(ft.difficultyGrade);
  const routeType = forestryRouteToApp(ft.routeType as "CIRCULAR" | "LINEAR");
  const displayName = titleCase(ft.name.replace(/\(CIRCULAR\)|\(LINEAR\)/gi, "").trim());
  const slug = slugFromId(id);
  const region = ft.region ?? "Nicosia";
  const elevation = estimateElevation(lengthKm, ft.difficultyGrade);
  const poi = ft.pointsOfInterest ?? "";
  const desc = `Official Forestry outside-forest route: ${lengthKm} km${ft.timeRaw ? `, ${ft.timeRaw}` : ""}, grade ${ft.difficultyGrade ?? "2"}. ${poi}`.slice(0, 420);
  const highlights = highlightsFromPoi(poi);
  const combineWith = COMBINE[id] ?? [];

  console.log(`  {
    id: "${id}",
    slug: "${slug}",
    name: "${displayName}",
    region: "${region}",
    difficulty: "${difficulty}",
    lengthKm: ${lengthKm},
    elevationGainM: ${elevation},
    durationMin: ${durationMin},
    description:
      ${JSON.stringify(desc)},
    highlights: ${JSON.stringify(highlights)},
    winterNotes: ${JSON.stringify(winterNote(region, ft.difficultyGrade))},
    bestSeason: ["winter", "spring", "autumn"],
    routeType: "${routeType}",
    trailhead: ${JSON.stringify(ft.start ?? "See Forestry Department fd56 listing")},
    bring: ["Water", "Sturdy shoes", "Layers"],
    localSecret: "Outside state forest—maintained by local authority. Stats from moa.gov.cy fd56.",
    combineWith: ${JSON.stringify(combineWith)},
    locationText: "${region}",
  },`);
}
