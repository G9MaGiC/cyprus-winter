import { describe, it, expect } from "vitest";
import { buildDiscoverItemListSchema } from "./discover-schema";

type MockDiscoverItem = {
  id: string;
  name: string;
  description: string;
  region: string;
  type: string;
};

const mockItems: MockDiscoverItem[] = [
  { id: "lefkara", name: "Lefkara", description: "A beautiful village known for lace and silver.", region: "Larnaca", type: "village" },
  { id: "kourion", name: "Kourion", description: "Ancient city-kingdom with a Greco-Roman theatre.", region: "Limassol", type: "ancient" },
];

describe("buildDiscoverItemListSchema", () => {
  it("returns valid schema.org ItemList structure", () => {
    const result = buildDiscoverItemListSchema(mockItems as any, "https://cypruswinter.com");

    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("ItemList");
    expect(result.name).toBe("Discover Cyprus Winter");
    expect(result.url).toBe("https://cypruswinter.com/discover");
    expect(result.numberOfItems).toBe(2);
  });

  it("maps items to ListItem elements with correct positions", () => {
    const result = buildDiscoverItemListSchema(mockItems as any, "https://cypruswinter.com");
    const elements = result.itemListElement;

    expect(elements).toHaveLength(2);
    expect(elements[0]["@type"]).toBe("ListItem");
    expect(elements[0].position).toBe(1);
    expect(elements[1].position).toBe(2);
  });

  it("creates TouristAttraction items with correct fields", () => {
    const result = buildDiscoverItemListSchema(mockItems as any, "https://cypruswinter.com");
    const item = result.itemListElement[0].item;

    expect(item["@type"]).toBe("TouristAttraction");
    expect(item.name).toBe("Lefkara");
    expect(item.url).toBe("https://cypruswinter.com/discover/lefkara");
    expect(item.address["@type"]).toBe("PostalAddress");
    expect(item.address.addressLocality).toBe("Larnaca");
    expect(item.address.addressCountry).toBe("CY");
  });

  it("truncates description to 160 characters", () => {
    const longDesc = "A".repeat(300);
    const items = [{ id: "x", name: "X", description: longDesc, region: "R", type: "t" }];
    const result = buildDiscoverItemListSchema(items as any, "https://example.com");

    expect(result.itemListElement[0].item.description).toHaveLength(160);
  });

  it("limits to 50 items maximum", () => {
    const manyItems = Array.from({ length: 100 }, (_, i) => ({
      id: `item-${i}`,
      name: `Item ${i}`,
      description: `Description ${i}`,
      region: "Region",
      type: "village",
    }));

    const result = buildDiscoverItemListSchema(manyItems as any, "https://example.com");
    expect(result.itemListElement).toHaveLength(50);
    expect(result.numberOfItems).toBe(100); // numberOfItems reflects actual count
  });

  it("handles empty items array", () => {
    const result = buildDiscoverItemListSchema([], "https://example.com");
    expect(result.numberOfItems).toBe(0);
    expect(result.itemListElement).toEqual([]);
  });

  it("uses provided siteUrl in URLs", () => {
    const result = buildDiscoverItemListSchema(mockItems as any, "https://staging.example.com");
    expect(result.url).toBe("https://staging.example.com/discover");
    expect(result.itemListElement[0].item.url).toBe("https://staging.example.com/discover/lefkara");
  });
});
