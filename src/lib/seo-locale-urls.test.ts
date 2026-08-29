import { describe, expect, it } from "vitest";
import { absoluteLocalizedUrl, buildStrategyAAlternates, localizedPathname } from "./seo-locale-urls";
import { SITE_URL } from "./site-url";

describe("seo-locale-urls", () => {
  it("localizedPathname omits prefix for default locale", () => {
    expect(localizedPathname("/discover", "en")).toBe("/discover");
    expect(localizedPathname("/", "en")).toBe("/");
  });

  it("localizedPathname adds locale segment for non-default locales", () => {
    expect(localizedPathname("/discover", "de")).toBe("/de/discover");
    expect(localizedPathname("/", "de")).toBe("/de");
  });

  it("buildStrategyAAlternates sets canonical to default locale URL and x-default", () => {
    const { canonical, languages } = buildStrategyAAlternates("/plan");
    expect(canonical).toBe(`${SITE_URL}/plan`);
    expect(languages["x-default"]).toBe(canonical);
    expect(languages.en).toBe(canonical);
    expect(languages.de).toBe(`${SITE_URL}/de/plan`);
    expect(languages.el).toBe(`${SITE_URL}/el/plan`);
    expect(languages.pl).toBe(`${SITE_URL}/pl/plan`);
  });

  it("home path builds locale home URLs", () => {
    const { canonical, languages } = buildStrategyAAlternates("/");
    expect(canonical).toBe(`${SITE_URL}/`);
    expect(languages.de).toBe(`${SITE_URL}/de`);
  });

  it("absoluteLocalizedUrl matches SITE_URL + localizedPathname", () => {
    expect(absoluteLocalizedUrl("/weather/november", "el")).toBe(
      `${SITE_URL}/el/weather/november`
    );
  });
});
