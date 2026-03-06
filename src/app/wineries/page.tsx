import type { Metadata } from "next";
import Link from "next/link";
import { wineries } from "@/data/wineries";
import { LAYOUT, CTA } from "@/lib/design-tokens";
import AttractionCard from "@/components/AttractionCard";
import PageHeader from "@/components/PageHeader";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";

export const metadata: Metadata = {
  title: "Cyprus Wineries in Winter | Wine Routes & Tastings",
  description:
    "Cyprus wine routes winter: Krasochoria, Laona, Commandaria. Winter tastings, cosy cellars. Book ahead. Fewer crowds, same wine.",
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

      <StickyPlanBarBlock sentinelId="wineries-plan-sentinel" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wineries.map((winery) => (
          <AttractionCard key={winery.id} a={winery} />
        ))}
      </div>

      <p className="mt-12 text-center text-olive/70 text-sm max-w-md mx-auto">
        Pair a winery visit with a trail or village.{" "}
        <Link href="/plan" className="text-aegean hover:underline">
          Plan your day
        </Link>
      </p>
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
