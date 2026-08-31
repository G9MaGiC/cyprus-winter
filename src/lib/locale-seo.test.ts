import { describe, expect, it } from "vitest";
import { absoluteUrlForLocale, alternateLanguageUrls, applyLocaleToMetadata, buildPathAlternates } from "./locale-seo";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-url";

describe("locale-seo", () => {
  it("default locale omits prefix in URL", () => {
    expect(absoluteUrlForLocale("/discover", routing.defaultLocale)).toBe(`${SITE_URL}/discover`);
    expect(absoluteUrlForLocale("", routing.defaultLocale)).toBe(SITE_URL);
  });

  it("non-default locale prefixes path", () => {
    expect(absoluteUrlForLocale("/discover", "el")).toBe(`${SITE_URL}/el/discover`);
    expect(absoluteUrlForLocale("/plan", "de")).toBe(`${SITE_URL}/de/plan`);
  });

  it("alternateLanguageUrls includes x-default and all locales", () => {
    const langs = alternateLanguageUrls("/trails");
    expect(langs["x-default"]).toBe(`${SITE_URL}/trails`);
    expect(langs[routing.defaultLocale]).toBe(`${SITE_URL}/trails`);
    expect(langs.el).toBe(`${SITE_URL}/el/trails`);
    expect(Object.keys(langs).length).toBe(routing.locales.length + 1);
  });

  it("buildPathAlternates canonicalizes to the unprefixed default-locale URL (Strategy A, AUD-117)", () => {
    const a = buildPathAlternates("/events");
    expect(a.canonical).toBe(`${SITE_URL}/events`);
    expect(a.languages?.de).toBe(`${SITE_URL}/de/events`);
  });

  it("applyLocaleToMetadata sets Strategy-A canonical and openGraph.url; locale URL stays in hreflang", () => {
    const out = applyLocaleToMetadata(
      { title: "T", openGraph: { title: "T", type: "website" } },
      "/search",
      "pl"
    );
    expect(out.alternates?.canonical).toBe(`${SITE_URL}/search`);
    expect(out.openGraph?.url).toBe(`${SITE_URL}/search`);
    expect(out.openGraph?.locale).toBe("pl_PL");
    expect(out.alternates?.languages?.pl).toBe(`${SITE_URL}/pl/search`);
  });
});
