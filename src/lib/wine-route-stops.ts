import { getWineRouteBySlug } from "@/data/wine-routes";
import { getWineryById, type Winery } from "@/data/wineries";

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
