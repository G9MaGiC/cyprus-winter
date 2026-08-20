import { describe, expect, it } from "vitest";
import {
  buildStatsKpiCsv,
  localeFromTrackedProperties,
  statsKpiFilename,
  type StatsKpiExportInput,
} from "./stats-kpi-export";

const sample: StatsKpiExportInput = {
  window: "mtd",
  windowLabel: "Month to date",
  rangeStartIso: "2026-05-01T00:00:00.000Z",
  rangeEndIso: "2026-05-15T14:30:00.000Z",
  bookingsThisMonth: 3,
  partnerRevenueEur: 90.5,
  partnerRevenueByWinery: [
    {
      providerId: "tsiakkas",
      providerName: "Tsiakkas Winery",
      bookingCount: 2,
      totalFeeEur: 70,
    },
  ],
  funnel: [
    { event: "plan_add", count: 12 },
    { event: "booking_start", count: 4 },
  ],
  localeBreakdown: [
    { locale: "en", count: 10 },
    { locale: "de", count: 2 },
  ],
  localeSource: "properties.path_or_locale",
  planGeographyBreakdown: [
    { bucket: "rural_mountain", count: 8 },
    { bucket: "beach_coast", count: 3 },
  ],
  planGeographySource: "plan_add.item_id",
};

describe("localeFromTrackedProperties", () => {
  it("uses an explicit locale property when it is a supported locale", () => {
    expect(localeFromTrackedProperties({ locale: "de", path: "/discover" })).toBe("de");
  });

  it("derives locale from a prefixed path when locale is missing", () => {
    expect(localeFromTrackedProperties({ path: "/el/plan" })).toBe("el");
  });

  it("treats unprefixed paths as the default locale", () => {
    expect(localeFromTrackedProperties({ path: "/discover" })).toBe("en");
  });

  it("returns unknown when neither locale nor path is usable", () => {
    expect(localeFromTrackedProperties({})).toBe("unknown");
    expect(localeFromTrackedProperties({ locale: "xx" })).toBe("unknown");
  });
});

describe("buildStatsKpiCsv", () => {
  it("includes funnel counts, SME revenue, and locale mix", () => {
    const csv = buildStatsKpiCsv(sample);
    expect(csv).toContain("funnel,plan_add,12");
    expect(csv).toContain("funnel,booking_start,4");
    expect(csv).toContain("partner,tsiakkas,Tsiakkas Winery,2,70");
    expect(csv).toContain("locale,en,10");
    expect(csv).toContain("locale,de,2");
    expect(csv).toContain("locale_source,properties.path_or_locale");
    expect(csv).toContain("plan_geography_source,plan_add.item_id");
    expect(csv).toContain("plan_geography,rural_mountain,8");
    expect(csv).toContain("plan_geography,beach_coast,3");
    expect(csv).toContain("bookings,total,3");
    expect(csv).toContain("partner_revenue_eur,total,90.5");
  });

  it("escapes commas in partner names", () => {
    const csv = buildStatsKpiCsv({
      ...sample,
      partnerRevenueByWinery: [
        {
          providerId: "foo",
          providerName: "Winery, Ltd",
          bookingCount: 1,
          totalFeeEur: 10,
        },
      ],
    });
    expect(csv).toContain('"Winery, Ltd"');
  });
});

describe("statsKpiFilename", () => {
  it("names files by window and UTC date", () => {
    const at = new Date("2026-05-15T14:30:00.000Z");
    expect(statsKpiFilename("csv", "mtd", at)).toBe("cyprus-winter-kpis-mtd-2026-05-15.csv");
    expect(statsKpiFilename("json", "7d", at)).toBe("cyprus-winter-kpis-7d-2026-05-15.json");
  });
});
