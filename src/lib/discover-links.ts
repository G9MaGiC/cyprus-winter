type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

/** Build detail URL with optional from/search/filter query params. */
export function createDetailLink(
  basePath: string,
  id: string,
  from?: string,
  query?: string,
  filter?: string
): string {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (query) params.set("q", query);
  if (filter) params.set("filter", filter);

  const queryString = params.toString();
  return `${basePath}/${id}${queryString ? `?${queryString}` : ""}`;
}

/** Localized type label for discover cards and detail hero badges. */
export function getDiscoverTypeLabel(
  type: string,
  tDetail: TranslateFn,
  tCommon: TranslateFn
): string {
  if (type === "restaurant") return tDetail("badgeEat");
  if (type === "ancient") return tCommon("placeTypes.ancientSite");
  if (type === "beach") return tCommon("placeTypes.beach");
  if (type === "village") return tCommon("placeTypes.village");
  if (type === "monastery") return tCommon("placeTypes.monastery");
  if (type === "activity") return tCommon("placeTypes.activity");
  if (type === "nature") return tCommon("placeTypes.nature");
  if (type === "winery") return tCommon("placeTypes.winery");
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/** Discover hub URL, optionally preserving an activity/section filter. */
export function discoverListHref(filter?: string | null): string {
  if (!filter?.trim()) return "/discover";
  return `/discover?filter=${encodeURIComponent(filter.trim())}`;
}

/** Detail URL with discover back-context for SmartBackLink and breadcrumbs. */
export function discoverDetailHref(
  placeId: string,
  filter?: string | null
): string {
  return createDetailLink(
    "/discover",
    placeId,
    "discover",
    undefined,
    filter?.trim() || undefined
  );
}
