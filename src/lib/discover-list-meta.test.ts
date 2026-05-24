import type { DiscoverItem } from "@/data/discover";
import { describe, expect, it } from "vitest";
import {
  discoverFilterPath,
  discoverSectionMetaKey,
  isDiscoverSectionFilterKey,
  isIndexedDiscoverFilter,
} from "./discover-list-meta";
import { buildDiscoverPageSchema } from "./discover-schema";

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
