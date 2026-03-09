import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-url";
import { wineries } from "@/data/wineries";
import { LAYOUT, CTA, TYPE, SECTION } from "@/lib/design-tokens";
import AttractionCard from "@/components/AttractionCard";
import PageHeader from "@/components/PageHeader";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";

const ogImage = `${SITE_URL}/images/cyprus/cyprus-winery-troodos.jpg`;

const wineriesItemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Cyprus Winter Wineries",
  description: "Cyprus winter wineries: Krasochoria, Laona, Commandaria. Fireside tastings, cosy cellars.",
  url: `${SITE_URL}/wineries`,
  numberOfItems: wineries.length,
  itemListElement: wineries.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Winery",
      name: item.name,
      description: item.description.slice(0, 160),
      url: `${SITE_URL}/discover/${item.id}`,
      address: { "@type": "PostalAddress", addressLocality: item.region, addressCountry: "CY" },
    },
  })),
};

export const metadata: Metadata = {
  title: "Cyprus Wineries in Winter | Wine Routes & Tastings",
  description:
    "Cyprus winter wineries: Krasochoria, Laona, Commandaria. Fireside tastings, cosy cellars. Book ahead for winter visits. Sixteen degrees when home is six.",
  alternates: { canonical: `${SITE_URL}/wineries` },
  openGraph: {
    title: "Cyprus Wineries in Winter | Wine Routes & Tastings",
    description: "Cyprus winter wineries: Krasochoria, Laona, Commandaria. Fireside tastings, cosy cellars. Book ahead.",
    url: `${SITE_URL}/wineries`,
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Cyprus winery village, winter" }],
  },
};

export default function WineriesPage() {
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(wineriesItemListSchema) }} />
      <PageHeader
        backHref="/discover"
        backLabel="Discover"
        title="Cyprus Wineries in Winter"
        description="Krasochoria, Laona, Akamas. Fireside tastings, Commandaria, Troodos views. Call ahead—many run lean in winter. For adults of legal drinking age."
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Discover", href: "/discover" },
          { label: "Wineries", href: "/wineries", isCurrent: true },
        ]}
      >
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/bookings" className={CTA.primaryCompact}>
            Book a tasting
          </Link>
          <Link href="/plan" className={CTA.secondaryCompact} aria-label="Build a day or pick a template">
            Plan your trip
          </Link>
        </div>
      </PageHeader>

      {(() => {
        const partners = wineries.filter((w) => w.isVerified);
        return partners.length > 0 ? (
          <section aria-labelledby="partners-heading" className="mb-12 sm:mb-16">
            <h2 id="partners-heading" className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>
              Book with our partners
            </h2>
            <p className="text-olive/70 text-sm mb-6 max-w-2xl">
              Verified partners receive your booking request directly and confirm by email.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((winery) => (
                <AttractionCard key={winery.id} a={winery} />
              ))}
            </div>
          </section>
        ) : null;
      })()}

      <div id="wineries-plan-sentinel" className="h-px pointer-events-none" aria-hidden />

      <h2 id="wineries-list" className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>
        All wineries
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wineries.map((winery) => (
          <AttractionCard key={winery.id} a={winery} />
        ))}
      </div>

      <div className={`${SECTION.footerBlock} ${LAYOUT.footerBottomClearance} relative`}>
        <div className="space-y-4">
          <p className="text-center text-olive/70 text-sm max-w-md mx-auto">
            Pair a winery visit with a trail or village.{" "}
            <Link href="/plan" className={SECTION.aegeanLink}>
              Build a day
            </Link>
          </p>
          <p className="text-center text-olive/70 text-sm max-w-md mx-auto">
            Explore wine routes:{" "}
        <Link href="/wine-routes/krasochoria" className={SECTION.aegeanLink}>
          Krasochoria
        </Link>
        {" · "}
        <Link href="/wine-routes/laona" className={SECTION.aegeanLink}>
          Laona
        </Link>
        {" · "}
        <Link href="/wine-routes/akamas" className={SECTION.aegeanLink}>
          Akamas
        </Link>
        {" · "}
        <Link href="/wine-routes/commandaria" className={SECTION.aegeanLink}>
          Commandaria
        </Link>
      </p>
        </div>
      </div>
      <StickyPlanBarBlock sentinelId="wineries-plan-sentinel" />
    </div>
  );
}
