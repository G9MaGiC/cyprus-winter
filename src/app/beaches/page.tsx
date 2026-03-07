import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-url";
import { beaches } from "@/data/attractions";
import { LAYOUT } from "@/lib/design-tokens";
import AttractionCard from "@/components/AttractionCard";
import PageHeader from "@/components/PageHeader";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";

const ogImage = `${SITE_URL}/images/cyprus/cyprus-ancient-kourion.jpg`;

const beachesItemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Cyprus Winter Beaches",
  description: "Best beaches in Cyprus winter: Nissi, Coral Bay, Konnos. Empty sand, golden light.",
  url: `${SITE_URL}/beaches`,
  numberOfItems: beaches.length,
  itemListElement: beaches.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "TouristAttraction",
      name: item.name,
      description: item.description.slice(0, 160),
      url: `${SITE_URL}/discover/${item.id}`,
      address: { "@type": "PostalAddress", addressLocality: item.region, addressCountry: "CY" },
    },
  })),
};

export const metadata: Metadata = {
  title: "Cyprus Winter Beaches | Nissi, Coral Bay, Konnos",
  description:
    "Best beaches in Cyprus winter: Nissi Beach, Coral Bay, Konnos Bay. Empty sand, golden light. Winter walks, no crowds. Sixteen degrees when home is six. Plan your visit. Free.",
  alternates: { canonical: `${SITE_URL}/beaches` },
  openGraph: {
    title: "Cyprus Winter Beaches | Nissi, Coral Bay, Konnos",
    description: "Best beaches in Cyprus winter: Nissi, Coral Bay, Konnos. Empty sand, golden light. Winter walks, no crowds.",
    url: `${SITE_URL}/beaches`,
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Cyprus winter beach, golden light" }],
  },
};

export default function BeachesPage() {
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(beachesItemListSchema) }} />
      <PageHeader
        backHref="/discover"
        backLabel="Discover"
        title="Cyprus Beaches in Winter"
        description="Empty sand, mild light. The sea is cold for swimming; winter beaches are for walks, coffee, and the light."
      />

      <h2 id="beaches-list" className="sr-only">
        Beaches in Cyprus winter
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {beaches.map((beach) => (
          <AttractionCard key={beach.id} a={beach} />
        ))}
      </div>

      <p className="mt-12 text-center text-olive/70 text-sm max-w-md mx-auto relative">
        <span id="beaches-plan-sentinel" className="h-px absolute top-0 left-0 right-0 pointer-events-none" aria-hidden />
        Combine a beach walk with ancient ruins or a village lunch.{" "}
        <Link href="/discover" className="text-aegean hover:underline">
          See all places
        </Link>
        {" · "}
        <Link href="/plan" className="text-aegean hover:underline">
          Plan your day
        </Link>
      </p>
      <StickyPlanBarBlock sentinelId="beaches-plan-sentinel" />
    </div>
  );
}
