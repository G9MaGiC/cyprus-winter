"use client";

import { forwardRef, useCallback, useEffect, useState } from "react";
import AppLink from "@/components/AppLink";
import AttractionCard from "@/components/AttractionCard";
import { OPEN_AI_EVENT } from "@/components/AIAssistantTrigger";
import { SECTION, CTA, EMPTY_STATE, LAYOUT, TYPE } from "@/lib/design-tokens";
import type { DiscoverSection } from "@/lib/discover-sections";
import { useTranslations } from "next-intl";

const ITEMS_PER_PAGE = 12;

type DiscoverSectionListProps = {
  sections: DiscoverSection[];
};

const DiscoverSectionList = forwardRef<HTMLElement | null, DiscoverSectionListProps>(
  function DiscoverSectionList({ sections }, ref) {
    const tCommon = useTranslations("common");
    const [shouldAnimate, setShouldAnimate] = useState(true);
    const [expanded, setExpanded] = useState<Record<string, number>>({});

    useEffect(() => {
      const t = setTimeout(() => setShouldAnimate(false), 700);
      return () => clearTimeout(t);
    }, []);

    const showMore = useCallback((sectionId: string, total: number) => {
      setExpanded((prev) => ({
        ...prev,
        [sectionId]: Math.min((prev[sectionId] ?? ITEMS_PER_PAGE) + ITEMS_PER_PAGE, total),
      }));
    }, []);

    return (
      <div className={`pt-2 ${SECTION.blockGap}`}>
        {sections.map((section, idx) => {
          const visibleCount = expanded[section.id] ?? ITEMS_PER_PAGE;
          const visibleItems = section.items.slice(0, visibleCount);
          const hasMore = section.items.length > visibleCount;

          return (
          <section
            key={section.id}
            id={section.id}
            ref={idx === 0 ? ref : undefined}
            aria-labelledby={`section-${section.id}`}
            className={`py-10 sm:py-14 ${idx % 2 === 1 ? `bg-sand/50 ${LAYOUT.stickyBarX}` : ""} ${shouldAnimate ? "section-reveal" : ""}`}
            style={shouldAnimate ? { animationDelay: `${idx * 60}ms` } : undefined}
          >
            <h2
              id={`section-${section.id}`}
              tabIndex={idx === 0 ? -1 : undefined}
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
                  {tCommon("discoverEmptyBody")}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <AppLink
                    href="/discover"
                    className={`min-w-[120px] justify-center ${CTA.primaryCompact}`}
                  >
                    {tCommon("allCategories")}
                  </AppLink>
                  <button
                    type="button"
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent(OPEN_AI_EVENT))
                    }
                    className={`min-w-[120px] justify-center ${CTA.secondaryCompact}`}
                    aria-label={tCommon("askAIRecommendationsAria")}
                  >
                    {tCommon("askAI")}
                  </button>
                </div>
              </div>
            ) : (
              <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {visibleItems.map((item) => (
                  <AttractionCard key={item.id} a={item} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => showMore(section.id, section.items.length)}
                    className={CTA.secondaryCompact}
                  >
                    {tCommon("showMore")} ({section.items.length - visibleCount})
                  </button>
                </div>
              )}
              </>
            )}
          </section>
          );
        })}
      </div>
    );
  }
);

export default DiscoverSectionList;
