import { describe, expect, it } from "vitest";
import { ADVISORY_LINKS, advisoryLinkForLocale } from "./advisory-links";
import { routing } from "@/i18n/routing";

describe("advisory links (AUD-25)", () => {
  it("covers every routing locale exactly", () => {
    expect(Object.keys(ADVISORY_LINKS).sort()).toEqual([...routing.locales].sort());
  });

  it("uses https and a distinct authority host per locale", () => {
    const hosts = Object.entries(ADVISORY_LINKS).map(([locale, href]) => {
      const url = new URL(href);
      expect(url.protocol, locale).toBe("https:");
      return url.host;
    });
    expect(new Set(hosts).size).toBe(hosts.length);
  });

  it("keeps the UK FCDO page for English", () => {
    expect(ADVISORY_LINKS.en).toBe("https://www.gov.uk/foreign-travel-advice/cyprus");
  });

  it("resolves known locales and falls back to English otherwise", () => {
    expect(advisoryLinkForLocale("de")).toBe(ADVISORY_LINKS.de);
    expect(advisoryLinkForLocale("he")).toBe(ADVISORY_LINKS.he);
    expect(advisoryLinkForLocale("xx")).toBe(ADVISORY_LINKS.en);
    expect(advisoryLinkForLocale("constructor")).toBe(ADVISORY_LINKS.en);
  });
});
