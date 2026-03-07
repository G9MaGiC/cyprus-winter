import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site-url";
import { beaches } from "@/data/attractions";
import { LAYOUT } from "@/lib/design-tokens";
import AttractionCard from "@/components/AttractionCard";
import PageHeader from "@/components/PageHeader";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";

export const metadata: Metadata = {
  title: "Cyprus Winter Beaches | Nissi, Coral Bay, Konnos",
  description:
    "Best beaches in Cyprus winter: Nissi Beach, Coral Bay, Konnos Bay. Empty sand, golden light. Winter walks, no crowds. Sixteen degrees when home is six. Plan your visit. Free.",
  alternates: { canonical: `${SITE_URL}/beaches` },
};

export default function BeachesPage() {
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
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
