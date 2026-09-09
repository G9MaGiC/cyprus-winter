import { describe, expect, it, vi } from "vitest";

const translations = vi.hoisted(() => ({
  "plan.meta": {
    title: "Plan your Cyprus winter days",
    description:
      "Build a day-by-day plan LONG form for the meta description tag.",
    ogDescription: "Plan Cyprus winter days SHORT",
    ogTitle: "Your Cyprus winter plan",
  } as Record<string, string>,
  "plan.share": {} as Record<string, string>,
}));

vi.mock("next-intl/server", () => ({
  getTranslations: async ({ namespace }: { locale: string; namespace: string }) => {
    const bag = translations[namespace as keyof typeof translations] ?? {};
    return (key: string) => bag[key] ?? key;
  },
}));

import { buildPlanPageMetadata } from "./plan-share-meta";

describe("buildPlanPageMetadata", () => {
  it("splits descriptions per house convention: long on the meta tag, short OG on the cards", async () => {
    const meta = await buildPlanPageMetadata("en", null);
    expect(meta.description).toContain("LONG form");
    // The batch-68 wire: reverting ogDescription -> description here is the
    // silent regression this test exists to catch.
    expect(meta.openGraph?.description).toBe("Plan Cyprus winter days SHORT");
    expect(meta.twitter?.description).toBe("Plan Cyprus winter days SHORT");
    expect(meta.title).toBe("Plan your Cyprus winter days");
  });

  it("does not noindex the bare plan page", async () => {
    const meta = await buildPlanPageMetadata("en", null);
    expect(meta.robots).toBeUndefined();
  });
});
