"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import Link from "next/link";
import AttractionCard from "@/components/AttractionCard";
import { OPEN_AI_EVENT } from "@/components/AIAssistantTrigger";
import FilterChips from "@/components/FilterChips";
import StickyPlanBar from "@/components/StickyPlanBar";
import RightNowNearYou from "@/app/_home/RightNowNearYou";
import { SECTION, CTA, EMPTY_STATE, LAYOUT, TYPE } from "@/lib/design-tokens";
import type { Attraction } from "@/data/attractions";
import type { Winery } from "@/data/wineries";
import type { Restaurant } from "@/data/restaurants";

const filterToSectionId: Record<string, string> = {
  beach: "coasts",
  nature: "coasts",
  coasts: "coasts",
  ancient: "ancient",
  village: "village",
  winery: "wine",
  wine: "wine",
  eat: "wine",
  restaurant: "wine",
  monastery: "monastery",
  family: "hidden",
  quiet: "hidden",
  hidden: "hidden",
  "off-beaten-path": "hidden",
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
  const hasWineriesInView = sectionsToShow.some((s) =>
    s.items.some((i) => "type" in i && i.type === "winery")
  );

  const chips = [
    { id: "", label: "All categories" },
    ...sections.map((s) => ({ id: s.id, label: s.title })),
  ];

  useEffect(() => {
    if (filter && firstSectionRef.current) {
      firstSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filter]);

  const totalCount = sectionsToShow.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div id="discover-content" aria-label="Discover places in Cyprus">
      <StickyPlanBar sentinelId="discover-plan-sentinel" />
      <div className={`sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-10 pt-2 sm:pt-0 pb-3 sm:pb-4 bg-background/95 backdrop-blur-sm border-b border-sand-200/50 ${LAYOUT.stickyBarX}`}>
        {(filter && sectionExists) && (
          <div className="flex flex-wrap items-baseline gap-x-2 text-sm mb-3">
            <span className="font-medium text-olive">
              {sections.find((s) => s.id === filter)!.title}
            </span>
            <span className="text-olive/60">— {totalCount} places</span>
            <span className="text-olive/40" aria-hidden>·</span>
            <Link
              href="/discover"
              className={`text-sm font-medium ${SECTION.aegeanLink}`}
            >
              All categories
            </Link>
          </div>
        )}
        <FilterChips
          chips={chips}
          isActive={(chip) => (chip.id === "" ? !filter : filter === chip.id)}
          getHref={(chip) =>
            chip.id === "" || filter === chip.id ? "/discover" : `/discover?filter=${chip.id}`
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
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link href="/plan" className={CTA.primaryCompact}>
            Plan your trip
          </Link>
          {hasWineriesInView && (
            <Link href="/bookings" className={CTA.secondaryCompact}>
              Book tastings
            </Link>
          )}
        </div>
      </div>

      <div className={`pt-6 sm:pt-8 ${SECTION.blockGap}`}>
        {sectionsToShow.map((section, idx) => (
          <section
            key={section.id}
            id={section.id}
            ref={idx === 0 ? firstSectionRef : undefined}
            aria-labelledby={`section-${section.id}`}
            className={`py-12 sm:py-16 ${idx % 2 === 1 ? `${SECTION.alt} ${LAYOUT.stickyBarX}` : ""}`}
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
                <p className="text-olive/80 mb-4">Nothing in this category yet. Browse all or ask AI—it knows the island.</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href="/discover" className={`min-w-[120px] justify-center ${CTA.primaryCompact}`}>
                    All categories
                  </Link>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent(OPEN_AI_EVENT))}
                    className={`min-w-[120px] justify-center ${CTA.secondaryCompact}`}
                  >
                    Ask AI
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {section.items.map((item) => (
                  <AttractionCard key={item.id} a={item} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
      <RightNowNearYou />

      <div className="mt-16 sm:mt-20 pt-8 sm:pt-10 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:pb-0 border-t border-sand-200/80 text-center relative">
        <div id="discover-plan-sentinel" className="h-px absolute top-0 left-0 right-0 pointer-events-none" aria-hidden />
        <p className="text-sm text-olive/70 mb-3">Add to your plan — or ask AI. It knows the island in winter.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/plan" className={CTA.primaryCompact}>
            Add to your plan
          </Link>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent(OPEN_AI_EVENT))}
            className={CTA.secondaryCompact}
          >
            Ask AI
          </button>
        </div>
      </div>
    </div>
  );
}
