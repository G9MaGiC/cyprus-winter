/**
 * Parses ?add= param: comma-separated place IDs, trimmed, deduped, max 50.
 */
export function parseAddParam(addParam: string | null): string[] {
  if (!addParam || addParam === "failed") return [];
  const ids = addParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);
  return [...new Set(ids)];
}
