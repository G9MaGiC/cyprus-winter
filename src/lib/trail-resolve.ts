import { trails, type Trail } from "@/data/trails";

export function findTrailByIdOrSlug(id: string): Trail | undefined {
  return trails.find((t) => t.id === id || t.slug === id);
}

export function isTrailSlugAlias(id: string, trail: Trail): boolean {
  return id !== trail.id;
}
