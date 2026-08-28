/** Build discover hub URL preserving filter and optional map view. */
export function buildDiscoverHubHref(
  filterParam: string,
  options?: { viewMap?: boolean; clearFilter?: boolean }
): string {
  const params = new URLSearchParams();
  const filter = options?.clearFilter ? "" : filterParam;
  if (filter) params.set("filter", filter);
  if (options?.viewMap) params.set("view", "map");
  const q = params.toString();
  return q ? `/discover?${q}` : "/discover";
}
