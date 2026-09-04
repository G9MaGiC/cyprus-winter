import { getWineRouteBySlug } from "@/data/wine-routes";
import { getWineryById, wineries, type Winery } from "@/data/wineries";

export { getWineRouteBySlug };

export const WINE_ROUTE_BOOK_FROM = "wine-route";

export function wineRouteBookHref(wineryId: string): string {
  return `/book/winery/${wineryId}?from=${WINE_ROUTE_BOOK_FROM}`;
}

/** Featured, bookable cellars for a published wine-route slug (order from data). */
export function getBookableWineriesForRoute(slug: string): Winery[] {
  const route = getWineRouteBySlug(slug);
  if (!route) return [];
  return route.bookableWineryIds.flatMap((id) => {
    const winery = getWineryById(id);
    return winery ? [winery] : [];
  });
}

/**
 * All wineries affiliated with a published route slug. Substring match (not
 * equality) so combined labels like "Laona\u2013Akamas" surface on both the
 * laona and akamas pages instead of matching neither (AUD-71).
 */
export function wineriesForRoute(slug: string): Winery[] {
  const needle = slug.toLowerCase();
  return wineries.filter((w) => w.wineRoute?.toLowerCase().includes(needle));
}
