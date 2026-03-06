import type { Metadata } from "next";
import Link from "next/link";
import { beaches } from "@/data/attractions";
import { LAYOUT } from "@/lib/design-tokens";
import AttractionCard from "@/components/AttractionCard";
import PageHeader from "@/components/PageHeader";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";

export const metadata: Metadata = {
  title: "Cyprus Winter Beaches | Nissi, Coral Bay, Konnos",
  description:
    "Best beaches in Cyprus winter: Nissi Beach, Coral Bay, Konnos Bay. Empty sand, golden light. Winter walks, no crowds. Sixteen degrees when home is six.",
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

      <StickyPlanBarBlock sentinelId="beaches-plan-sentinel" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {beaches.map((beach) => (
          <AttractionCard key={beach.id} a={beach} />
        ))}
      </div>

      <p className="mt-12 text-center text-olive/70 text-sm max-w-md mx-auto">
        Combine a beach walk with ancient ruins or a village lunch.{" "}
        <Link href="/discover" className="text-aegean hover:underline">
          See all places
        </Link>
        {" · "}
        <Link href="/plan" className="text-aegean hover:underline">
          Plan your day
        </Link>
      </p>
    </div>
  );
}
