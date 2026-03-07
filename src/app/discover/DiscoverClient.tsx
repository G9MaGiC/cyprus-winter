"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import Link from "next/link";
import AttractionCard from "@/components/AttractionCard";
import { OPEN_AI_EVENT } from "@/components/AIAssistantTrigger";
import FilterChips from "@/components/FilterChips";
import StickyPlanBar from "@/components/StickyPlanBar";
import { SECTION, CTA, EMPTY_STATE, LAYOUT, TYPE } from "@/lib/design-tokens";
import type { Attraction } from "@/data/attractions";
import type { Winery } from "@/data/wineries";
import type { Restaurant } from "@/data/restaurants";

const filterToSectionId: Record<string, string> = {
  beach: "beach",
  ancient: "ancient",
  village: "village",
  winery: "winery",
  wine: "winery",
  eat: "eat",
  restaurant: "eat",
  monastery: "monastery",
  nature: "beach",
  family: "family",
  quiet: "quiet",
  "off-beaten-path": "quiet",
};

type Section = { id: string; title: string; items: (Attraction | Winery | Restaurant)[] };

export default function DiscoverClient({
  sections,
}: {
  sections: Section[];
}) {
  const searchParams = useSearchParams();
  const filterParam = searchParams?.get("filter") ?? "";
  const filter = filterToSectionId[filterParam];
  const sectionExists = filter && sections.some((s) => s.id === filter);
  const sectionsToShow = sectionExists
    ? sections.filter((s) => s.id === filter)
    : sections;
  const firstSectionRef = useRef<HTMLElement>(null);

  const chips = [
    { id: "", label: "All categories" },
    ...sections.map((s) => ({ id: s.id, label: s.title })),
  ];

  useEffect(() => {
    if (filter && firstSectionRef.current) {
      firstSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filter]);

  return (
    <div id="discover-content" aria-label="Discover places in Cyprus">
      <StickyPlanBar sentinelId="discover-plan-sentinel" />
      <div className={`sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:top-0 z-10 pt-3 sm:pt-0 pb-4 mb-6 sm:mb-8 bg-background/95 backdrop-blur-sm ${LAYOUT.stickyBarX}`}>
        <FilterChips
          chips={chips}
          isActive={(chip) => (chip.id === "" ? !filter : filter === chip.id)}
          getHref={(chip) =>
            chip.id === ""
              ? "/discover"
              : filter === chip.id
                ? "/discover"
                : `/discover?filter=${chip.id}`
          }
          ariaLabel="Filter by category"
        />
        {filterParam && !sectionExists && (
          <p className="text-sm text-olive/70 mt-3 break-words">
            That filter doesn&apos;t exist—showing all places.{" "}
            <Link
              href="/discover"
              className="inline-flex items-center min-h-[44px] py-2 text-aegean hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 rounded"
            >
              See all categories
            </Link>
          </p>
        )}
        {(filter && sectionExists) && (
          <p className="text-sm text-olive/70 mt-3 break-words">
            Showing{" "}
            <strong>
              {sections.find((s) => s.id === filter)!.title}
              {filterParam === "nature" && " (Nature & coasts)"}
            </strong>
            {" · "}
            <Link
              href="/discover"
              className="inline-flex items-center min-h-[44px] py-2 text-aegean hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 rounded"
            >
              See all categories
            </Link>
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href="/plan" className={CTA.primaryCompact}>
            Plan your trip
          </Link>
          {filter === "winery" && (
            <Link href="/bookings" className={CTA.secondaryCompact}>
              Book tastings
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-16 sm:space-y-20">
        {sectionsToShow.map((section, idx) => (
          <section
            key={section.id}
            id={section.id}
            ref={idx === 0 ? firstSectionRef : undefined}
            aria-labelledby={`section-${section.id}`}
          >
            <h2 id={`section-${section.id}`} className={`${TYPE.sectionTitle} break-words ${SECTION.headingGap}`}>
              {section.title}
            </h2>
            {section.items.length === 0 ? (
              <div
                className={EMPTY_STATE}
                role="status"
                aria-live="polite"
              >
                <p className="text-olive/80 mb-4">Nothing here yet. Switch filters or ask AI—it knows Troodos to coast.</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent(OPEN_AI_EVENT))}
                    className={`min-w-[120px] justify-center ${CTA.secondaryCompact}`}
                  >
                    Ask AI
                  </button>
                  <Link href="/discover" className={`min-w-[120px] justify-center ${CTA.secondaryCompact}`}>
                    Browse all categories
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((item) => (
                  <AttractionCard key={item.id} a={item} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
      <div className="mt-12 pt-8 border-t border-sand-200/80 text-center relative">
        <div id="discover-plan-sentinel" className="h-px absolute top-0 left-0 right-0 pointer-events-none" aria-hidden />
        <Link href="/plan" className={CTA.primaryCompact}>
          Plan your trip
        </Link>
      </div>
    </div>
  );
}
