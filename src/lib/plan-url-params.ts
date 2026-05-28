/**
 * Update the plan page query string without a Next.js client navigation.
 * Avoids router.replace racing with in-flight link clicks (e.g. Book tasting on a winery row).
 */
export function patchPlanUrlSearchParams(mutate: (params: URLSearchParams) => void): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const before = url.search;
  mutate(url.searchParams);
  if (url.search === before) return;
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

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
