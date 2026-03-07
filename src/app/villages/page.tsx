import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-url";
import { villages } from "@/data/attractions";
import { LAYOUT } from "@/lib/design-tokens";
import AttractionCard from "@/components/AttractionCard";
import PageHeader from "@/components/PageHeader";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";

export const metadata: Metadata = {
  title: "Cyprus Villages in Winter | Lefkara, Omodos, Platres",
  description:
    "Cyprus villages in winter: Lefkara, Omodos, Platres. Cobbles, kafenions, fireside wine. Mountain and wine heartland. Plan or explore. Sixteen degrees when home is six. Free.",
  alternates: { canonical: `${SITE_URL}/villages` },
};

export default function VillagesPage() {
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/discover"
        backLabel="Discover"
        title="Cyprus Villages in Winter"
        description="Cobbled streets, wine heartland, lace and silver. Winter villages are quieter; the tavernas warm, the views clear."
      />

      <h2 id="villages-list" className="sr-only">
        Cyprus winter villages
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {villages.map((village) => (
          <AttractionCard key={village.id} a={village} />
        ))}
      </div>

      <p className="mt-12 text-center text-olive/70 text-sm max-w-md mx-auto relative">
        <span id="villages-plan-sentinel" className="h-px absolute top-0 left-0 right-0 pointer-events-none" aria-hidden />
        Combine a village visit with a trail or winery.{" "}
        <Link href="/discover" className="text-aegean hover:underline">
          See all places
        </Link>
        {" · "}
        <Link href="/plan" className="text-aegean hover:underline">
          Plan your day
        </Link>
      </p>
      <StickyPlanBarBlock sentinelId="villages-plan-sentinel" />
    </div>
  );
}
