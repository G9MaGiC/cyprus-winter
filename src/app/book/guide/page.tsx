import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/data/guides";
import { LAYOUT, CTA, CARD, TYPE, SECTION } from "@/lib/design-tokens";
import { SITE_URL } from "@/lib/site-url";
import BackLink from "@/components/BackLink";
import { trails } from "@/data/trails";

export const metadata: Metadata = {
  title: "Book a Guided Hike | Cyprus Winter",
  description:
    "Guided winter hikes in Troodos, Paphos, and Akamas. Local guides for Artemis, Caledonia Falls, Adonis, and more. Book ahead. Cyprus Winter.",
  alternates: { canonical: `${SITE_URL}/book/guide` },
};

function getTrailNames(guide: (typeof guides)[0]): string[] {
  return guide.trailIds
    .map((tid) => trails.find((t) => t.id === tid || t.slug === tid))
    .filter(Boolean)
    .map((t) => t!.name);
}

export default function GuidesListPage() {
  return (
    <div className={`min-h-screen bg-sand ${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <BackLink href="/trails" label="Back to trails" />

      <div className="mb-8">
        <h1 className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>Book a guided hike</h1>
        <p className="text-olive/70 max-w-2xl">
          Local guides for Troodos, Paphos, and Akamas. Winter conditions expertise. Small groups, experienced
          leaders. Book ahead and they&apos;ll confirm by email.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide) => {
          const trailNames = getTrailNames(guide);
          return (
            <div
              key={guide.id}
              className={`${CARD.base} ${CARD.content} ${CARD.hover} rounded-xl overflow-hidden flex flex-col`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-aegean/20 text-aegean">
                  Guided hike
                </span>
                {guide.isVerified && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-aegean/20 text-aegean">
                    Verified partner
                  </span>
                )}
              </div>
              <h2 className="font-display text-lg font-semibold text-olive mb-1">{guide.name}</h2>
              <p className="text-sm text-olive/70 mb-2">{guide.region}</p>
              <p className="text-sm text-olive/80 mb-4 flex-1 line-clamp-3">{guide.description}</p>
              {trailNames.length > 0 && (
                <p className="text-xs text-olive/60 mb-4">
                  Trails: {trailNames.slice(0, 4).join(", ")}
                  {trailNames.length > 4 ? ` +${trailNames.length - 4} more` : ""}
                </p>
              )}
              <Link
                href={`/book/guide/${guide.id}`}
                className={`w-full justify-center ${CTA.primaryCompact}`}
                aria-label={`Book a guided hike with ${guide.name}`}
              >
                Book a hike
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mt-12 text-center text-olive/70 text-sm">
        <Link href="/trails" className="text-aegean hover:underline">
          Browse all trails
        </Link>
        {" · "}
        <Link href="/bookings" className="text-aegean hover:underline">
          My bookings
        </Link>
      </p>
    </div>
  );
}
