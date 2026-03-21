import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/site-url", () => ({
  SITE_URL: "https://cypruswinter.com",
}));

vi.mock("@/data/trails", () => ({
  trails: [
    {
      id: "artemis",
      name: "Artemis Trail",
      description: "A circular trail around the summit of Mount Olympus through black pine forest. Panoramic views of the Troodos range.",
      region: "Troodos",
      lengthKm: 7,
      difficulty: "moderate",
    },
    {
      id: "caledonia-falls",
      name: "Caledonia Falls",
      description: "Walk along a stream through dense forest to reach the impressive 12m Caledonia waterfall. Best after rain.",
      region: "Troodos",
      lengthKm: 3,
      difficulty: "easy",
    },
  ],
}));

import { getTrailsItemListSchema } from "./trails-schema";

describe("getTrailsItemListSchema", () => {
  it("returns valid schema.org ItemList structure", () => {
    const result = getTrailsItemListSchema();
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("ItemList");
    expect(result.name).toBe("Cyprus Winter Trails");
    expect(result.url).toBe("https://cypruswinter.com/trails");
  });

  it("sets numberOfItems to total trail count", () => {
    const result = getTrailsItemListSchema();
    expect(result.numberOfItems).toBe(2);
  });

  it("maps trails to ListItem elements with correct positions", () => {
    const result = getTrailsItemListSchema();
    expect(result.itemListElement).toHaveLength(2);
    expect(result.itemListElement[0].position).toBe(1);
    expect(result.itemListElement[1].position).toBe(2);
  });

  it("creates TouristAttraction items with trail details", () => {
    const result = getTrailsItemListSchema();
    const item = result.itemListElement[0].item;

    expect(item["@type"]).toBe("TouristAttraction");
    expect(item.name).toBe("Artemis Trail");
    expect(item.url).toBe("https://cypruswinter.com/trails/artemis");
    expect(item.address.addressLocality).toBe("Troodos");
    expect(item.address.addressCountry).toBe("CY");
  });

  it("includes distance and difficulty as additionalProperty", () => {
    const result = getTrailsItemListSchema();
    const props = result.itemListElement[0].item.additionalProperty;

    expect(props).toHaveLength(2);
    expect(props[0]).toEqual({
      "@type": "PropertyValue",
      name: "distance",
      value: "7 km",
    });
    expect(props[1]).toEqual({
      "@type": "PropertyValue",
      name: "difficulty",
      value: "moderate",
    });
  });

  it("truncates description to 160 characters", () => {
    const result = getTrailsItemListSchema();
    for (const el of result.itemListElement) {
      expect(el.item.description.length).toBeLessThanOrEqual(160);
    }
  });
});
