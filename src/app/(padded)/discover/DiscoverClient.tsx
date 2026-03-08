"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import AttractionCard from "@/components/AttractionCard";
import { OPEN_AI_EVENT } from "@/components/AIAssistantTrigger";
import FilterChips from "@/components/FilterChips";
import StickyPlanBar from "@/components/StickyPlanBar";
import RightNowNearYou from "@/app/_home/RightNowNearYou";
import { SECTION, CTA, EMPTY_STATE, LAYOUT, TYPE } from "@/lib/design-tokens";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { sortDiscoverItemsByInterests } from "@/lib/personalization";
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
  const { prefs, hydrated } = useUserPreferences();
  const filterParam = searchParams?.get("filter") ?? "";
  const filter = filterToSectionId[filterParam];
  const sectionExists = filter && sections.some((s) => s.id === filter);

  const sectionsToShow = useMemo(() => {
    const raw = sectionExists
      ? sections.filter((s) => s.id === filter)
      : sections;
    if (!hydrated || prefs.interests.length === 0) return raw;
    return raw.map((section) => ({
      ...section,
      items: sortDiscoverItemsByInterests(section.items, prefs.interests),
    }));
  }, [sections, filter, sectionExists, hydrated, prefs.interests]);

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
  const activeSection = sections.find((s) => s.id === filter);

  const scrollToMap = () => {
    document.getElementById("discover-map")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div id="discover-content" aria-label="Discover places in Cyprus" className="-mt-4 sm:-mt-6">
      <StickyPlanBar sentinelId="discover-plan-sentinel" />

      <div
        className={`sticky ${LAYOUT.stickyTop} z-10 bg-background/98 backdrop-blur-md border-b border-sand-200/60 ${LAYOUT.stickyBarX} py-4 sm:py-5`}
      >
        <div className={`${LAYOUT.list} mx-auto space-y-3`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="prose-label text-olive/60 uppercase tracking-wider">
              {filter && sectionExists
                ? `${filterParam === "nature" ? "Nature & coasts" : activeSection?.title ?? "Places"} · ${totalCount} places`
                : "Browse by category"}
            </p>
            {filter && sectionExists && (
              <Link
                href="/discover"
                className={`text-xs font-medium ${SECTION.aegeanLink}`}
              >
                Clear filter
              </Link>
            )}
          </div>

          <FilterChips
            chips={chips}
            isActive={(chip) => (chip.id === "" ? !filter : filter === chip.id)}
            getHref={(chip) =>
              chip.id === "" || filter === chip.id
                ? "/discover"
                : `/discover?filter=${chip.id}`
            }
            ariaLabel="Filter by category"
          />

          {filterParam && !sectionExists && (
            <p className="text-sm text-olive/70 break-words">
              That filter doesn&apos;t exist—showing all places.{" "}
              <Link href="/discover" className={SECTION.aegeanLink}>
                All categories
              </Link>
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/plan" className={CTA.primaryCompact}>
              Plan your trip
            </Link>
            {hasWineriesInView && (
              <Link href="/bookings" className={CTA.secondaryCompact}>
                Book tastings
              </Link>
            )}
            <button
              type="button"
              onClick={scrollToMap}
              className="inline-flex items-center min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium text-olive/70 hover:bg-sand-200/80 hover:text-olive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
            >
              View on map
            </button>
          </div>
        </div>
      </div>

      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX}`}>
        <p className="pt-6 sm:pt-8 pb-2 text-sm text-olive/70">
          Beaches, villages, wineries—curated for winter.
        </p>

        <div className={`pt-2 ${SECTION.blockGap}`}>
          {sectionsToShow.map((section, idx) => (
            <section
              key={section.id}
              id={section.id}
              ref={idx === 0 ? firstSectionRef : undefined}
              aria-labelledby={`section-${section.id}`}
              className={`py-10 sm:py-14 ${idx % 2 === 1 ? `${SECTION.alt} ${LAYOUT.stickyBarX}` : ""}`}
            >
              <h2
                id={`section-${section.id}`}
                className={`${TYPE.sectionTitle} break-words ${SECTION.headingGap}`}
              >
                {section.title}
              </h2>

              {section.items.length === 0 ? (
                <div
                  className={`${EMPTY_STATE} ${SECTION.headingGap}`}
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-olive/80 mb-4">
                    No places in this category. Try another filter or ask the AI—it
                    knows the island.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href="/discover"
                      className={`min-w-[120px] justify-center ${CTA.primaryCompact}`}
                    >
                      All categories
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        window.dispatchEvent(new CustomEvent(OPEN_AI_EVENT))
                      }
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

        <RightNowNearYou
          title="Right now near you"
        />

        <footer
          className={`${SECTION.footerBlock} pt-14 sm:pt-16 pb-8 sm:pb-12 ${LAYOUT.footerBottomClearance} text-center`}
        >
          <p className={`text-sm text-olive/70 ${SECTION.headingGap} max-w-md mx-auto leading-relaxed`}>
            Add to your plan—or ask the AI. It knows the island in winter.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/plan" className={CTA.primaryCompact}>
              Add to your plan
            </Link>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new CustomEvent(OPEN_AI_EVENT))
              }
              className={CTA.secondaryCompact}
            >
              Ask AI
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
