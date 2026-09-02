import { describe, expect, it } from "vitest";
import { allDiscoverIds } from "@/data";
import { trails } from "@/data/trails";
import { wineries } from "@/data/wineries";
import { guides } from "@/data/guides";
import { WINE_ROUTES } from "@/data/wine-routes";
import { REGION_CONFIGS } from "@/data/regions";
import { MONTH_SLUGS } from "@/lib/weather-month-suggestions";
import { routing } from "@/i18n/routing";
import { LOCALES, ROUTE_ID_SETS } from "@/lib/route-ids.generated";

/**
 * Guard for the 404 middleware's generated slug sets: every set must exactly
 * mirror the source its dynamic page's generateStaticParams uses. When the
 * data layer moves, this fails until `npm run generate:route-ids` is re-run —
 * a stale set would either soft-404 a new page's slug (missing id → wrongly
 * rewritten to 404) or let a removed slug keep soft-404ing.
 */

const EXPECTED: Record<string, string[]> = {
  discover: allDiscoverIds,
  trails: trails.map((t) => t.id),
  bookWinery: wineries.map((w) => w.id),
  bookGuide: guides.map((g) => g.id),
  wineRoutes: WINE_ROUTES.map((r) => r.slug),
  regions: REGION_CONFIGS.map((c) => c.slug),
  weather: [...MONTH_SLUGS],
};

describe("route-ids.generated (404 middleware sets)", () => {
  for (const [family, ids] of Object.entries(EXPECTED)) {
    it(`${family} mirrors its data source exactly`, () => {
      const generated = ROUTE_ID_SETS[family];
      expect(generated, `missing family ${family}`).toBeTruthy();
      expect([...generated].sort()).toEqual([...new Set(ids)].sort());
    });
  }

  it("carries no families beyond the guarded set", () => {
    expect(Object.keys(ROUTE_ID_SETS).sort()).toEqual(Object.keys(EXPECTED).sort());
  });

  it("locale set mirrors the routing config", () => {
    expect([...LOCALES].sort()).toEqual([...routing.locales].sort());
  });
});
