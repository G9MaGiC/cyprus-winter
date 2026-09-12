import { describe, expect, it } from "vitest";
import { WINE_ROUTES } from "@/data/wine-routes";
import { getWineryById } from "@/data/wineries";
import {
  getBookableWineriesForRoute,
  getWineRouteBySlug,
  wineriesForRoute,
  wineRouteBookHref,
} from "@/lib/wine-route-stops";
import { wineries } from "@/data/wineries";
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

/**
 * Official Cyprus wine routes and area labels that carry no page yet — data
 * may reference them, but any NEW wineRoute value must either match a
 * published page slug or be added here consciously (AUD-71 guard).
 */
const WINE_ROUTES_WITHOUT_PAGE = new Set([
  "pitsilia",
  "nicosia",
  "troodos",
  "limassol",
  "limassol corridor",
  "limassol coast",
  "larnaca",
  "larnaca hills",
  "larnaca\u2013limassol corridor",
]);

describe("wineRoute data guard (AUD-71)", () => {
  it("every wineRoute value maps to a published route page or the documented no-page list", () => {
    const pageSlugs = WINE_ROUTES.map((r) => r.slug);
    for (const w of wineries) {
      if (!w.wineRoute) continue;
      const value = w.wineRoute.toLowerCase();
      const matchesPage = pageSlugs.some((slug) => value.includes(slug));
      expect(
        matchesPage || WINE_ROUTES_WITHOUT_PAGE.has(value),
        `${w.id}: wineRoute "${w.wineRoute}" matches no route page and is not in the documented no-page list`,
      ).toBe(true);
    }
  });

  it("wineriesForRoute matches combined labels on both routes (Laona\u2013Akamas)", () => {
    const laona = wineriesForRoute("laona").map((w) => w.id);
    const akamas = wineriesForRoute("akamas").map((w) => w.id);
    // The combined-label carriers left the public catalog in the 2026-09-02
    // quarantine; the loop re-engages if one is restored or re-verified.
    const combined = wineries.filter((w) => w.wineRoute === "Laona\u2013Akamas").map((w) => w.id);
    for (const id of combined) {
      expect(laona, `laona should include combined-label winery ${id}`).toContain(id);
      expect(akamas, `akamas should include combined-label winery ${id}`).toContain(id);
    }
  });

  it("wineriesForRoute is a superset of the curated bookable stops", () => {
    for (const route of WINE_ROUTES) {
      const all = new Set(wineriesForRoute(route.slug).map((w) => w.id));
      for (const id of route.bookableWineryIds) {
        expect(all, `${route.slug}: bookable stop ${id} missing from wineriesForRoute`).toContain(id);
      }
    }
  });
});
