/**
 * Client-side search over places, trails, and events.
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

function matches(query: string, ...texts: string[]): boolean {
  const q = normalize(query);
  if (q.length < 2) return false;
  return texts.some((t) => normalize(t).includes(q));
}

export function search(query: string, limit = 20): SearchResult[] {
  const results: SearchResult[] = [];
  const q = query.trim();
  if (q.length < 2) return results;

  for (const p of allPlaces) {
    if (matches(q, p.name, p.region)) {
      const href = p.type === "trail" ? `/trails/${p.id}` : `/discover/${p.id}`;
      results.push({ kind: "place", item: p, href });
      if (results.length >= limit) return results;
    }
  }

  for (const t of trails) {
    if (results.some((r) => r.item.id === t.id)) continue;
    if (matches(q, t.name, t.region, t.description)) {
      results.push({ kind: "trail", item: { id: t.id, name: t.name, region: t.region }, href: `/trails/${t.id}` });
      if (results.length >= limit) return results;
    }
  }

  for (const e of winterEvents) {
    if (matches(q, e.name, e.region, e.description, e.venue ?? "")) {
      results.push({
        kind: "event",
        item: { id: e.id, name: e.name, region: e.region, month: e.month },
        href: "/events",
      });
      if (results.length >= limit) return results;
    }
  }

  return results;
}
