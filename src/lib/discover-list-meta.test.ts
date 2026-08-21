import type { DiscoverItem } from "@/data/discover";
import { describe, expect, it, vi } from "vitest";
import {
  buildDiscoverListMetadata,
  discoverFilterPath,
  discoverSectionMetaKey,
  isDiscoverSectionFilterKey,
  isIndexedDiscoverFilter,
} from "./discover-list-meta";
import { buildDiscoverPageSchema } from "./discover-schema";

vi.mock("next-intl/server", () => ({
  getTranslations: async () => {
    const bag: Record<string, string> = {
      title: "Discover Cyprus Winter",
      description: "Curated places.",
      ogAlt: "Omodos village alt EL",
    };
    const t = (key: string) => bag[key] ?? key;
    t.has = (key: string) => key in bag;
    return t;
  },
}));

describe("discover-list-meta", () => {
  it("maps section filter params to meta keys", () => {
    expect(discoverSectionMetaKey("nature")).toBe("nature");
    expect(discoverSectionMetaKey("beach")).toBe("nature");
    expect(discoverSectionMetaKey("village")).toBe("village");
    expect(discoverSectionMetaKey("winery")).toBe("wine");
    expect(discoverSectionMetaKey("unknown")).toBeNull();
  });

  it("builds indexed filter paths", () => {
    expect(discoverFilterPath()).toBe("/discover");
    expect(discoverFilterPath("village")).toBe("/discover?filter=village");
    expect(discoverFilterPath("bouldering")).toBe("/discover?filter=bouldering");
    expect(discoverFilterPath("bogus")).toBe("/discover");
  });

  it("recognises indexed filters", () => {
    expect(isDiscoverSectionFilterKey("wine")).toBe(true);
    expect(isIndexedDiscoverFilter("wellness")).toBe(true);
    expect(isIndexedDiscoverFilter("bogus")).toBe(false);
  });

  it("uses translated OG image alt instead of English constants", async () => {
    const meta = await buildDiscoverListMetadata("el");
    const images = meta.openGraph?.images;
    const first = Array.isArray(images) ? images[0] : images;
    expect(first && typeof first === "object" && "alt" in first ? first.alt : null).toBe(
      "Omodos village alt EL"
    );
    expect(meta.title).toBe("Discover Cyprus Winter");
  });
});

describe("discover-schema", () => {
  it("emits @graph with WebPage, BreadcrumbList, and ItemList", () => {
    const schema = buildDiscoverPageSchema({
      items: [
        {
          id: "omodos",
          name: "Omodos",
          region: "Limassol",
          type: "village",
          description: "Cobbled wine village in the Krasochoria hills.",
          highlights: [],
          bestFor: [],
        } as DiscoverItem,
      ],
      siteUrl: "https://cypruswinter.com",
      pageUrl: "https://cypruswinter.com/discover?filter=village",
      name: "Cyprus Villages Winter",
      description: "Curated villages.",
      breadcrumbs: [
        { name: "Home", url: "https://cypruswinter.com/" },
        { name: "Discover", url: "https://cypruswinter.com/discover" },
        { name: "Villages", url: "https://cypruswinter.com/discover?filter=village" },
      ],
    });

    expect(schema["@graph"]).toHaveLength(3);
    expect(schema["@graph"]?.map((n) => n["@type"])).toEqual([
      "WebPage",
      "BreadcrumbList",
      "ItemList",
    ]);
  });
});
