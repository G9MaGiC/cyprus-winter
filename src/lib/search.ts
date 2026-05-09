/**
 * Client-side search over places, trails, and events.
 * Results are relevance-ranked: exact/prefix match on name > region > description.
 */
import { allPlaces, type PlanItem } from "@/data";
import { trails } from "@/data/trails";
import { winterEvents } from "@/data/events";

export type SearchResult =
  | { kind: "place"; item: PlanItem; href: string }
  | { kind: "trail"; item: { id: string; name: string; region: string }; href: string }
  | { kind: "event"; item: { id: string; name: string; region: string; month: string }; href: string };

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

type ScoredResult = SearchResult & { score: number };
const trailById = new Map(trails.map((t) => [t.id, t]));
const eventById = new Map(winterEvents.map((e) => [e.id, e]));

/** Score for a single token: exact id > exact name > prefix name > contains name > prefix region > contains region > description. */
function tokenScore(
  token: string,
  fields: { id?: string; name: string; region?: string; description?: string; venue?: string }
): number {
  const t = normalize(token);
  if (t.length < 2) return 0;

  const n = (s: string) => normalize(s ?? "");
  const nameNorm = n(fields.name);
  const regionNorm = n(fields.region ?? "");
  const descNorm = n((fields.description ?? "") + " " + (fields.venue ?? ""));

  if (fields.id && n(fields.id) === t) return 100;
  if (nameNorm === t) return 90;
  if (nameNorm.startsWith(t)) return 80;
  if (nameNorm.includes(t)) return 70;
  if (regionNorm === t) return 50;
  if (regionNorm.startsWith(t)) return 45;
  if (regionNorm.includes(t)) return 40;
  if (descNorm.includes(t)) return 25;
  return 0;
}

/** Multi-word: all tokens must match. Returns sum of per-token scores or 0 if any token fails. */
function matchScore(
  query: string,
  fields: { id?: string; name: string; region?: string; description?: string; venue?: string }
): number {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 0;

  let total = 0;
  for (const token of tokens) {
    const s = tokenScore(token, fields);
    if (s === 0) return 0;
    total += s;
  }
  return total;
}

function toSearchResult(p: PlanItem): SearchResult {
  const href =
    p.type === "trail"
      ? `/trails/${p.id}`
      : p.type === "event"
        ? `/events#${encodeURIComponent(p.id)}`
        : `/discover/${p.id}`;
  if (p.type === "trail") {
    return { kind: "trail", item: { id: p.id, name: p.name, region: p.region }, href };
  }
  if (p.type === "event") {
    const e = eventById.get(p.id);
    return { kind: "event", item: { id: p.id, name: p.name, region: p.region, month: e?.month ?? "" }, href };
  }
  return { kind: "place", item: p, href };
}

export function search(query: string, limit = 20): SearchResult[] {
  const q = query.trim();
  if (q.length < 2) return [];

  const scored: ScoredResult[] = [];

  for (const p of allPlaces) {
    const fields: { id?: string; name: string; region?: string; description?: string; venue?: string } = {
      id: p.id,
      name: p.name,
      region: p.region,
    };
    if (p.type === "trail") {
      const t = trailById.get(p.id);
      if (t) fields.description = t.description;
    } else if (p.type === "event") {
      const e = eventById.get(p.id);
      if (e) {
        fields.description = e.description;
        fields.venue = e.venue ?? "";
      }
    }
    const score = matchScore(q, fields);
    if (score > 0) scored.push({ ...toSearchResult(p), score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((r) => {
    const { score: _score, ...rest } = r;
    void _score;
    return rest as SearchResult;
  });
}
