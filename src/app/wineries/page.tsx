import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-url";
import { wineries } from "@/data/wineries";
import { LAYOUT, CTA, TYPE, SECTION } from "@/lib/design-tokens";
import AttractionCard from "@/components/AttractionCard";
import PageHeader from "@/components/PageHeader";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";

export const metadata: Metadata = {
  title: "Cyprus Wineries in Winter | Wine Routes & Tastings",
  description:
    "Cyprus winter wineries: Krasochoria, Laona, Commandaria. Fireside tastings, cosy cellars. Book ahead for winter visits. Sixteen degrees when home is six. Free guide.",
  alternates: { canonical: `${SITE_URL}/wineries` },
};

export default function WineriesPage() {
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/discover"
        backLabel="Discover"
        title="Cyprus Wineries in Winter"
        description="Krasochoria, Laona, Akamas. Fireside tastings, Commandaria, Troodos views. Call ahead—many run lean in winter."
      >
        <Link href="/bookings" className={`mt-4 px-5 py-2.5 rounded-lg ${CTA.primaryCompact}`}>
          Book a tasting
        </Link>
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

      <h2 id="wineries-list" className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>
        All wineries
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wineries.map((winery) => (
          <AttractionCard key={winery.id} a={winery} />
        ))}
      </div>

      <p className="mt-12 text-center text-olive/70 text-sm max-w-md mx-auto relative">
        <span id="wineries-plan-sentinel" className="h-px absolute top-0 left-0 right-0 pointer-events-none" aria-hidden />
        Pair a winery visit with a trail or village.{" "}
        <Link href="/plan" className="text-aegean hover:underline">
          Plan your day
        </Link>
      </p>
      <StickyPlanBarBlock sentinelId="wineries-plan-sentinel" />
      <p className="mt-6 text-center text-olive/70 text-sm max-w-md mx-auto">
        Explore wine routes:{" "}
        <Link href="/wine-routes/krasochoria" className="text-aegean hover:underline">
          Krasochoria
        </Link>
        {" · "}
        <Link href="/wine-routes/laona" className="text-aegean hover:underline">
          Laona
        </Link>
        {" · "}
        <Link href="/wine-routes/akamas" className="text-aegean hover:underline">
          Akamas
        </Link>
        {" · "}
        <Link href="/wine-routes/commandaria" className="text-aegean hover:underline">
          Commandaria
        </Link>
      </p>
    </div>
  );
}
