import { describe, expect, it } from "vitest";
import { WINE_ROUTES } from "@/data/wine-routes";
import { getWineryById } from "@/data/wineries";
import {
  getBookableWineriesForRoute,
  getWineRouteBySlug,
  wineRouteBookHref,
} from "@/lib/wine-route-stops";
import { isCallAheadHours, placeCardHours } from "@/lib/place-card-hours";

describe("wine-route-stops (G6)", () => {
  it("every published wine route lists at least one existing bookable winery", () => {
    expect(WINE_ROUTES.length).toBeGreaterThan(0);
    for (const route of WINE_ROUTES) {
      expect(route.bookableWineryIds.length).toBeGreaterThan(0);
      for (const id of route.bookableWineryIds) {
        expect(getWineryById(id), `${route.slug} missing winery ${id}`).toBeDefined();
      }
    }
  });

  it("getBookableWineriesForRoute returns those wineries in listed order", () => {
    const stops = getBookableWineriesForRoute("krasochoria");
    expect(stops.map((w) => w.id)).toEqual(
      getWineRouteBySlug("krasochoria")?.bookableWineryIds,
    );
    expect(stops.every((w) => w.wineRoute?.toLowerCase() === "krasochoria")).toBe(true);
  });

  it("unknown slug returns empty bookable list", () => {
    expect(getBookableWineriesForRoute("not-a-route")).toEqual([]);
  });

  it("each route has a Book tasting href for the first stop", () => {
    for (const route of WINE_ROUTES) {
      const [first] = getBookableWineriesForRoute(route.slug);
      expect(first?.id).toBeTruthy();
      expect(wineRouteBookHref(first!.id)).toBe(`/book/winery/${first!.id}?from=wine-route`);
    }
  });

  it("featured stops expose winter hours or call-ahead", () => {
    for (const route of WINE_ROUTES) {
      const stops = getBookableWineriesForRoute(route.slug);
      expect(stops.length).toBeGreaterThan(0);
      for (const winery of stops) {
        const hours = placeCardHours(winery);
        expect(hours, `${winery.id} missing hours`).toBeTruthy();
        if (isCallAheadHours(hours)) {
          expect(hours!.toLowerCase()).toMatch(/appointment|call|request|visit/i);
        }
      }
    }
  });
});
