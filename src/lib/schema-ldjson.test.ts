import { describe, it, expect } from "vitest";
import { schemaForLdJson } from "./schema-ldjson";

describe("schemaForLdJson", () => {
  it("returns a JSON string representation of the object", () => {
    const schema = { "@type": "Thing", name: "Test" };
    const result = schemaForLdJson(schema);
    expect(result).toBe(JSON.stringify(schema));
  });

  it("handles nested objects", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      name: "Lefkara",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Larnaca",
        addressCountry: "CY",
      },
    };
    const result = schemaForLdJson(schema);
    const parsed = JSON.parse(result);
    expect(parsed.address.addressLocality).toBe("Larnaca");
  });

  it("handles arrays in schema", () => {
    const schema = {
      "@type": "ItemList",
      itemListElement: [
        { "@type": "ListItem", position: 1 },
        { "@type": "ListItem", position: 2 },
      ],
    };
    const result = schemaForLdJson(schema);
    const parsed = JSON.parse(result);
    expect(parsed.itemListElement).toHaveLength(2);
  });

  it("escapes special characters safely", () => {
    const schema = {
      name: 'Test "quoted" <script>alert("xss")</script>',
    };
    const result = schemaForLdJson(schema);
    // JSON.stringify properly escapes quotes
    expect(result).toContain('\\"quoted\\"');
    // The result should be valid JSON
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it("handles empty object", () => {
    const result = schemaForLdJson({});
    expect(result).toBe("{}");
  });

  it("handles boolean and number values", () => {
    const schema = { active: true, count: 42, ratio: 3.14 };
    const result = schemaForLdJson(schema);
    const parsed = JSON.parse(result);
    expect(parsed.active).toBe(true);
    expect(parsed.count).toBe(42);
    expect(parsed.ratio).toBe(3.14);
  });

  it("handles null values", () => {
    const schema = { name: "Test", value: null };
    const result = schemaForLdJson(schema as any);
    const parsed = JSON.parse(result);
    expect(parsed.value).toBeNull();
  });
});
