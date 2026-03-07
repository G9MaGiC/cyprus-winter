/**
 * Exports all places (attractions, wineries, restaurants, trails, events) to JSON
 * for the enrichment pipeline. Run: npx tsx scripts/enrich-places/export-places.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  beaches,
  ancientSites,
  villages,
  monasteries,
  natureSites,
} from "../../src/data/attractions";
import { wineries } from "../../src/data/wineries";
import { restaurants } from "../../src/data/restaurants";
import { trails } from "../../src/data/trails";
import { winterEvents } from "../../src/data/events";

type PlaceExport = {
  id: string;
  name: string;
  region: string;
  type: string;
  /** Known URLs to crawl (booking, shop, official) */
  urls: string[];
  /** Current facts we want to verify/enrich */
  current?: {
    openingHours?: string;
    contactPhone?: string;
    description?: string;
    highlights?: string[];
  };
};

function toPlace(a: { id: string; name: string; region: string } & Record<string, unknown>): PlaceExport {
  const urls: string[] = [];
  if (a.bookingUrl && typeof a.bookingUrl === "string") urls.push(a.bookingUrl);
  if (a.shopUrl && typeof a.shopUrl === "string") urls.push(a.shopUrl);
  if (a.url && typeof a.url === "string") urls.push(a.url);
  return {
    id: a.id,
    name: a.name,
    region: a.region,
    type: a.type as string,
    urls: [...new Set(urls)],
    current: {
      openingHours: typeof a.openingHours === "string" ? a.openingHours : undefined,
      contactPhone: typeof a.contactPhone === "string" ? a.contactPhone : undefined,
      description: typeof a.description === "string" ? a.description : undefined,
      highlights: Array.isArray(a.highlights) ? (a.highlights as string[]) : undefined,
    },
  };
}

const attractions = [
  ...beaches,
  ...ancientSites,
  ...villages,
  ...monasteries,
  ...natureSites,
].map((a) => toPlace(a));

const wineryPlaces = wineries.map((w) => toPlace(w));
const restaurantPlaces = restaurants.map((r) => toPlace(r));
const trailPlaces = trails.map((t) => ({
  ...toPlace(t),
  type: "trail" as const,
}));
const eventPlaces = winterEvents.map((e) => ({
  id: e.id,
  name: e.name,
  region: e.region,
  type: "event" as const,
  urls: e.url ? [e.url] : [],
  current: { description: e.description },
}));

const places: PlaceExport[] = [
  ...attractions,
  ...wineryPlaces,
  ...restaurantPlaces,
  ...trailPlaces,
  ...eventPlaces,
];

const outPath = join(process.cwd(), "scripts", "enrich-places", "places.json");
writeFileSync(outPath, JSON.stringify(places, null, 2), "utf-8");
console.log(`Exported ${places.length} places to ${outPath}`);
