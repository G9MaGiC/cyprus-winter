import { describe, expect, it, vi } from "vitest";

const translations = vi.hoisted(() => ({
  en: {
    "meta.title": "Cyprus Winter Beaches | Nissi, Coral Bay, Konnos",
    "meta.description": "Best beaches in Cyprus winter EN",
    "meta.schemaDescription": "OG beaches EN",
    "meta.ogAlt": "Beach alt EN",
  },
  el: {
    "meta.title": "Παραλίες Κύπρου τον χειμώνα | Νησί, Coral Bay, Κόννος",
    "meta.description": "Καλύτερες παραλίες τον χειμώνα EL",
    "meta.schemaDescription": "OG beaches EL",
    "meta.ogAlt": "Beach alt EL",
  },
}));

vi.mock("next-intl/server", () => ({
  getTranslations: async ({ locale }: { locale: string }) => {
    const bag = translations[locale as "en" | "el"] ?? translations.en;
    const t = (key: string) => bag[key as keyof typeof bag] ?? key;
    t.has = (key: string) => key in bag;
    return t;
  },
}));

import { buildTranslatedHubMetadata, TRANSLATED_HUB_META } from "./translated-page-meta";

describe("buildTranslatedHubMetadata", () => {
  it("exposes configs for guest hubs with message keys", () => {
    expect(TRANSLATED_HUB_META.beaches.path).toBe("/beaches");
    expect(TRANSLATED_HUB_META.wineRoutes.namespace).toBe("wineRoutes.hub");
    expect(TRANSLATED_HUB_META.privacy.path).toBe("/privacy");
    expect(TRANSLATED_HUB_META.events.namespace).toBe("events.page");
    expect(TRANSLATED_HUB_META.login.robots).toEqual({ index: false, follow: true });
    expect(TRANSLATED_HUB_META.guidesTroodosDecember.path).toBe("/guides/troodos-december");
    expect(TRANSLATED_HUB_META.install.robots).toEqual({ index: false, follow: false });
    expect(TRANSLATED_HUB_META.bookings.namespace).toBe("bookings.page");
  });

  it("returns localized title/description and locale canonical", async () => {
    const en = await buildTranslatedHubMetadata("beaches", "en");
    const el = await buildTranslatedHubMetadata("beaches", "el");
    expect(en.title).toContain("Beaches");
    expect(el.title).toContain("Παραλίες");
    expect(en.title).not.toEqual(el.title);
    expect(el.alternates?.canonical).toContain("/el/beaches");
    expect(en.alternates?.canonical).toMatch(/\/beaches$/);
  });

  it("spreads robots from hub config when present", async () => {
    const privacy = await buildTranslatedHubMetadata("privacy", "en");
    const login = await buildTranslatedHubMetadata("login", "en");
    expect(privacy.robots).toEqual({ index: true, follow: true });
    expect(login.robots).toEqual({ index: false, follow: true });
  });
});
