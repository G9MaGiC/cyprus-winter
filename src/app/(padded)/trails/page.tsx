import type { Metadata } from "next";
import TrailsClient from "./TrailsClient";
import { SITE_URL } from "@/lib/site-url";
import { trails } from "@/data/trails";

export const metadata: Metadata = {
  title: "Cyprus Winter Trails | Troodos, Paphos & Akamas Hiking",
  description:
    "Cyprus trails in winter: Troodos, Paphos, Akamas. Conditions, difficulty, length. Winter hiking tips. Sixteen degrees when home is six. Plan your hike.",
  alternates: { canonical: `${SITE_URL}/trails` },
  openGraph: {
    title: "Cyprus Winter Trails | Troodos, Paphos & Akamas Hiking",
    description: "Cyprus trails in winter: Troodos, Paphos, Akamas. Conditions, difficulty, length.",
    url: `${SITE_URL}/trails`,
    type: "website",
  },
};

const trailsItemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Cyprus Winter Trails",
  description: "Troodos, Paphos, Akamas hiking trails. Conditions, difficulty, length. Winter hiking in Cyprus.",
  url: `${SITE_URL}/trails`,
  numberOfItems: trails.length,
  itemListElement: trails.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "TouristAttraction",
      name: t.name,
      description: t.description.slice(0, 160),
      url: `${SITE_URL}/trails/${t.id}`,
      address: { "@type": "PostalAddress", addressLocality: t.region, addressCountry: "CY" },
      additionalProperty: [
        { "@type": "PropertyValue", name: "distance", value: `${t.lengthKm} km` },
        { "@type": "PropertyValue", name: "difficulty", value: t.difficulty },
      ],
    },
  })),
};

export default function TrailsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(trailsItemListSchema) }} />
      <TrailsClient />
    </>
  );
}
