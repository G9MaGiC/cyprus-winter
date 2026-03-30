import { haversineKm } from "./geo";

export type RankablePlace = {
  id: string;
  name: string;
  region: string;
  description: string;
  seasonTags?: string[];
  editorialPriority?: number;
  latitude?: number;
  longitude?: number;
  type?: string;
  highlights?: string[];
  bestFor?: string[];
};

export type RankingOptions = {
  query?: string;
  season?: string;
  category?: string;
  userLocation?: { lat: number; lng: number };
  limit?: number;
};

function keywordScore(place: RankablePlace, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const fields = [
    place.name,
    place.description,
    place.region,
    place.type ?? "",
    ...(place.highlights ?? []),
    ...(place.bestFor ?? []),
  ].join(" ").toLowerCase();

  const words = q.split(/\s+/).filter(Boolean);
  const matched = words.filter((w) => fields.includes(w)).length;
  return words.length > 0 ? matched / words.length : 0;
}

function distanceScore(place: RankablePlace, userLocation?: { lat: number; lng: number }): number {
  if (!userLocation || place.latitude == null || place.longitude == null) return 0;
  const km = haversineKm(userLocation.lat, userLocation.lng, place.latitude, place.longitude);
  // Normalize: 0km = 1.0, 100km+ = 0.0
  return Math.max(0, 1 - km / 100);
}

function seasonScore(place: RankablePlace, season?: string): number {
  if (!season || !place.seasonTags?.length) return 0.5;
  return place.seasonTags.includes(season) ? 1 : 0;
}

function categoryScore(place: RankablePlace, category?: string): number {
  if (!category) return 0;
  const c = category.toLowerCase();
  const type = (place.type ?? "").toLowerCase();
  const tags = [...(place.highlights ?? []), ...(place.bestFor ?? [])].join(" ").toLowerCase();
  if (type === c) return 1;
  if (tags.includes(c)) return 0.7;
  return 0;
}

function editorialScore(place: RankablePlace): number {
  const p = place.editorialPriority ?? 3;
  // Priority 1 → 1.0, 2 → 0.66, 3 → 0.33
  return Math.max(0, 1 - (p - 1) / 3);
}

export function rankPlaces(places: RankablePlace[], options: RankingOptions = {}): RankablePlace[] {
  const { query = "", season, category, userLocation, limit = 5 } = options;

  const scored = places.map((place) => {
    const kw = keywordScore(place, query);
    const dist = distanceScore(place, userLocation);
    const sea = seasonScore(place, season);
    const cat = categoryScore(place, category);
    const ed = editorialScore(place);

    // MVP weights from spec
    const hasLocation = userLocation != null;
    const score = hasLocation
      ? 0.35 * kw + 0.25 * dist + 0.15 * sea + 0.15 * cat + 0.10 * ed
      : 0.40 * kw + 0.20 * sea + 0.20 * cat + 0.20 * ed;

    return { place, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.place);
}
