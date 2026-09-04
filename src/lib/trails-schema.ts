import { SITE_URL } from "@/lib/site-url";
import { truncateForSchema } from "@/lib/schema-text";
import { trails } from "@/data/trails";

export function getTrailsItemListSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cyprus Winter Trails",
    description:
      "Troodos, Paphos, Akamas hiking trails. Conditions, difficulty, length. Winter hiking in Cyprus.",
    url: `${SITE_URL}/trails`,
    numberOfItems: trails.length,
    itemListElement: trails.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TouristAttraction",
        name: t.name,
        description: truncateForSchema(t.description),
        url: `${SITE_URL}/trails/${t.id}`,
        address: { "@type": "PostalAddress", addressLocality: t.region, addressCountry: "CY" },
        additionalProperty: [
          { "@type": "PropertyValue", name: "distance", value: `${t.lengthKm} km` },
          { "@type": "PropertyValue", name: "difficulty", value: t.difficulty },
        ],
      },
    })),
  };
}
