import type { DiscoverItem } from "@/data/discover";

export function buildDiscoverItemListSchema(
  items: DiscoverItem[],
  siteUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Discover Cyprus Winter",
    description:
      "Beaches, ancient sites, villages, wineries, monasteries. Curated Cyprus winter places.",
    url: `${siteUrl}/discover`,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 50).map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TouristAttraction",
        name: item.name,
        description: item.description.slice(0, 160),
        url: `${siteUrl}/discover/${item.id}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: item.region,
          addressCountry: "CY",
        },
      },
    })),
  };
}
