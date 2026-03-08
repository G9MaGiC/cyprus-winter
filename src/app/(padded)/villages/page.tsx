import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-url";
import { villages } from "@/data/attractions";
import { LAYOUT, SECTION, CTA } from "@/lib/design-tokens";
import AttractionCard from "@/components/AttractionCard";
import PageHeader from "@/components/PageHeader";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";

const ogImage = `${SITE_URL}/images/cyprus/cyprus-village-omodos.jpg`;

const villagesItemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Cyprus Winter Villages",
  description: "Cyprus villages in winter: Lefkara, Omodos, Platres. Cobbles, kafenions, fireside wine.",
  url: `${SITE_URL}/villages`,
  numberOfItems: villages.length,
  itemListElement: villages.map((item, i) => ({
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
  title: "Cyprus Villages in Winter | Lefkara, Omodos, Platres",
  description:
    "Cyprus villages in winter: Lefkara, Omodos, Platres. Cobbles, kafenions, fireside wine. Mountain and wine heartland. Plan or explore. Sixteen degrees when home is six. Free.",
  alternates: { canonical: `${SITE_URL}/villages` },
  openGraph: {
    title: "Cyprus Villages in Winter | Lefkara, Omodos, Platres",
    description: "Cyprus villages in winter: Lefkara, Omodos, Platres. Cobbles, kafenions, fireside wine. Mountain and wine heartland.",
    url: `${SITE_URL}/villages`,
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Omodos village, Cyprus winter" }],
  },
};

export default function VillagesPage() {
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(villagesItemListSchema) }} />
      <PageHeader
        backHref="/discover"
        backLabel="Discover"
        title="Cyprus Villages in Winter"
        description="Cobbled streets, wine heartland, lace and silver. Winter villages are quieter; the tavernas warm, the views clear."
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Discover", href: "/discover" },
          { label: "Villages", href: "/villages", isCurrent: true },
        ]}
      >
        <Link href="/plan" className={`mt-4 inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-lg ${CTA.primaryCompact}`}>
          Plan your trip
        </Link>
      </PageHeader>

      <h2 id="villages-list" className="sr-only">
        Cyprus winter villages
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {villages.map((village) => (
          <AttractionCard key={village.id} a={village} />
        ))}
      </div>

      <div className={`${SECTION.footerBlock} relative`}>
        <span id="villages-plan-sentinel" className="h-px absolute top-0 left-0 right-0 pointer-events-none" aria-hidden />
        <p className="text-center text-olive/70 text-sm max-w-md mx-auto">
        Combine a village visit with a trail or winery.{" "}
        <Link href="/discover" className={SECTION.aegeanLink}>
          See all places
        </Link>
        {" · "}
        <Link href="/plan" className={SECTION.aegeanLink}>
          Plan your day
        </Link>
      </p>
      </div>
      <StickyPlanBarBlock sentinelId="villages-plan-sentinel" />
    </div>
  );
}
