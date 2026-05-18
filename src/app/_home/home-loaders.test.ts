import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => {
    const t = (key: string, values?: Record<string, string | number>) => {
      if (values) return `${key}:${JSON.stringify(values)}`;
      return key;
    };
    return t;
  }),
}));

vi.mock("@/lib/trail-summary-cache", () => ({
  getTrailSummary: vi.fn(),
}));

vi.mock("@/lib/weather-live", () => ({
  getLiveWeather: vi.fn(),
}));

import { getTrailSummary } from "@/lib/trail-summary-cache";
import { getLiveWeather } from "@/lib/weather-live";
import { getHomeHeroCopy } from "@/app/_home/home-hero-copy";
import { getHomeTrailConditionsStripProps } from "@/app/_home/home-trail-conditions-data";
import { getHomeWeatherStripProps } from "@/app/_home/home-weather-data";
import { getHomeThisWeekGridProps } from "@/app/_home/home-this-week-data";

describe("home loaders", () => {
  beforeEach(() => {
    vi.mocked(getTrailSummary).mockReset();
    vi.mocked(getLiveWeather).mockReset();
    vi.mocked(getLiveWeather).mockResolvedValue(null);
    vi.mocked(getTrailSummary).mockResolvedValue(null);
  });

  it("getHomeHeroCopy uses i18n keys for micro-links", async () => {
    const copy = await getHomeHeroCopy("el");
    expect(copy.familyPicksLabel).toBe("hero.familyPicksLink");
    expect(copy.templateLabel).toBe("hero.templateLink");
  });

  it("getHomeWeatherStripProps returns translated prompt", async () => {
    const props = await getHomeWeatherStripProps("en");
    expect(props.prompt).toMatch(/^weatherStrip\.prompts\./);
    expect(props.heading).toMatch(/^weatherStrip\.heading:/);
  });

  it("getHomeTrailConditionsStripProps summarizes open trails", async () => {
    const props = await getHomeTrailConditionsStripProps("en");
    expect(props.summaryLabel).toBeTruthy();
    expect(props.heading).toBe("trailConditionsStrip.heading");
  });

  it("getHomeThisWeekGridProps uses translated weather tip", async () => {
    const props = await getHomeThisWeekGridProps("en");
    expect(props.weatherTip).toMatch(/^weatherStrip\.prompts\./);
    expect(props.eventSubtitle).not.toMatch(/Limassol Carnival/);
  });

  it("getHomeThisWeekGridProps formats trail status via trails namespace", async () => {
    vi.mocked(getTrailSummary).mockResolvedValue({
      artemis: { status: "open", surface: "dry" },
    });
    const props = await getHomeThisWeekGridProps("en");
    expect(props.trailLabel).toContain("report.options.status.open.label");
    expect(props.trailLabel).toContain("report.options.surface.dry.label");
  });
});
