import { describe, expect, it } from "vitest";
import { absoluteLocalizedUrl, buildStrategyAAlternates, localizedPathname } from "./seo-locale-urls";

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
    expect(canonical).toBe("https://cypruswinter.com/plan");
    expect(languages["x-default"]).toBe(canonical);
    expect(languages.en).toBe(canonical);
    expect(languages.de).toBe("https://cypruswinter.com/de/plan");
    expect(languages.el).toBe("https://cypruswinter.com/el/plan");
    expect(languages.pl).toBe("https://cypruswinter.com/pl/plan");
  });

  it("home path builds locale home URLs", () => {
    const { canonical, languages } = buildStrategyAAlternates("/");
    expect(canonical).toBe("https://cypruswinter.com/");
    expect(languages.de).toBe("https://cypruswinter.com/de");
  });

  it("absoluteLocalizedUrl matches SITE_URL + localizedPathname", () => {
    expect(absoluteLocalizedUrl("/weather/november", "el")).toBe("https://cypruswinter.com/el/weather/november");
  });
});
