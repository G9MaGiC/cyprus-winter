/** Shared parsers for moa.gov.cy Forestry Department trail pages. */

export type ForestryRouteType = "CIRCULAR" | "LINEAR";

export type ParsedForestryTrail = {
  num: number;
  name: string;
  routeType: ForestryRouteType;
  region: string | null;
  start?: string;
  length?: string;
  time?: string;
  difficulty?: string;
  pointsOfInterest?: string;
  note?: string;
};

const REGION_HEADERS = new Set(["PAFOS", "LIMASSOL", "NICOSIA", "LARNACA", "FAMAGUSTA"]);

const REGION_LABEL: Record<string, string> = {
  PAFOS: "Paphos",
  LIMASSOL: "Limassol",
  NICOSIA: "Nicosia",
  LARNACA: "Larnaca",
  FAMAGUSTA: "Famagusta",
};

export function normalizeForestryName(name: string): string {
  return name
    .replace(/\s+/g, " ")
    .replace(/[–—]/g, "-")
    .trim()
    .toUpperCase();
}

/** Strip HTML and parse fd56 outside-forest trail blocks. */
export function parseFd56OutsideTrails(html: string): ParsedForestryTrail[] {
  let text = html.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<[^>]+>/g, "");
  text = text
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
  text = text.replace(/\n+/g, "\n");

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let currentRegion: string | null = null;
  const trails: ParsedForestryTrail[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const regionKey = line.toUpperCase();
    if (REGION_HEADERS.has(regionKey)) {
      currentRegion = REGION_LABEL[regionKey] ?? line;
      continue;
    }

    const header = line.match(/^(\d+)\.\s*(.+?)\s*\((CIRCULAR|LINEAR|circular|linear)/i);
    if (!header) continue;

    const trail: ParsedForestryTrail = {
      num: Number(header[1]),
      name: header[2].replace(/\s+/g, " ").trim(),
      routeType: header[3].toUpperCase() as ForestryRouteType,
      region: currentRegion,
    };

    i++;
    while (
      i < lines.length &&
      !/^\d+\./.test(lines[i]) &&
      !REGION_HEADERS.has(lines[i].toUpperCase())
    ) {
      const l = lines[i];
      if (/^Start:/i.test(l)) trail.start = l.replace(/^Start:\s*/i, "").trim();
      else if (/^Length:/i.test(l)) trail.length = l.replace(/^Length:\s*/i, "").trim();
      else if (/^Time/i.test(l)) trail.time = l.replace(/^Time[^:]*:\s*/i, "").trim();
      else if (/^Degree of difficulty/i.test(l))
        trail.difficulty = l.replace(/^Degree of difficulty[^:]*:\s*/i, "").trim();
      else if (/^Points of interest/i.test(l))
        trail.pointsOfInterest = l.replace(/^Points of interest[^:]*:\s*/i, "").trim();
      else if (l.startsWith("NB:")) trail.note = l.slice(3).trim();
      i++;
    }
    i--;
    trails.push(trail);
  }

  return trails;
}

/** Parse primary length in km from Forestry length strings. */
export function parseLengthKm(raw?: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/,/g, ".");
  const km = cleaned.match(/([\d.]+)\s*km/i);
  if (km) return Number(km[1]);
  const m = cleaned.match(/([\d.]+)\s*m\b/i);
  if (m) return Number(m[1]) / 1000;
  return null;
}

/** Parse duration in minutes from Forestry time strings. */
export function parseDurationMin(raw?: string): number | null {
  if (!raw) return null;
  const hoursRange = raw.match(/([\d.]+)\s*-\s*([\d.]+)\s*h/i);
  if (hoursRange) return Math.round(((Number(hoursRange[1]) + Number(hoursRange[2])) / 2) * 60);
  const hours = raw.match(/([\d.]+)\s*h/i);
  if (hours) return Math.round(Number(hours[1]) * 60);
  const mins = raw.match(/([\d.]+)\s*min/i);
  if (mins) return Math.round(Number(mins[1]));
  return null;
}

/** Forestry grade 1–3 → app difficulty. */
export function gradeToDifficulty(grade?: string): "easy" | "moderate" | "hard" {
  const n = grade?.match(/(\d)/)?.[1];
  if (n === "1") return "easy";
  if (n === "3") return "hard";
  return "moderate";
}

export function forestryRouteToApp(routeType: ForestryRouteType): "loop" | "point-to-point" | "out-and-back" {
  return routeType === "CIRCULAR" ? "loop" : "point-to-point";
}

export function extractPdfLinks(html: string, baseUrl: string): string[] {
  const links = new Set<string>();
  for (const m of html.matchAll(/href="([^"]+\.pdf[^"]*)"/gi)) {
    let href = m[1];
    if (href.startsWith("../")) {
      href = new URL(href.replace(/^\.\.\//, ""), baseUrl).href;
    } else if (href.startsWith("/")) {
      href = `https://www.moa.gov.cy${href}`;
    }
    links.add(decodeURIComponent(href.split("?")[0] ?? href));
  }
  return [...links].sort();
}
