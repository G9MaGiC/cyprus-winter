"use client";

import { forwardRef, useEffect, useState } from "react";
import AppLink from "@/components/AppLink";
import AttractionCard from "@/components/AttractionCard";
import AskAIButton from "@/components/AskAIButton";
import { SECTION, CTA, EMPTY_STATE, HOME, HUB, LAYOUT, TYPE } from "@/lib/design-tokens";
import type { DiscoverCardSection } from "@/lib/discover-sections";
import { isActivityFilterKey } from "@/lib/activity-catalog";
import { useTranslations } from "next-intl";

type DiscoverSectionListProps = {
  sections: DiscoverCardSection[];
  /**
   * Render at most this many cards per section (multi-section overview).
   * The full section stays one tap away at /discover?filter=<id>, which the
   * server renders complete — capping cuts the overview page's HTML and
   * hydration cost ~5x (237 cards -> ~54; see docs/PERF_BASELINE_2026-08.md).
   */
  capPerSection?: number;
};

const DiscoverSectionList = forwardRef<HTMLElement | null, DiscoverSectionListProps>(
  function DiscoverSectionList({ sections, capPerSection }, ref) {
    const tCommon = useTranslations("common");
    const tDiscover = useTranslations("discover");
    const [shouldAnimate, setShouldAnimate] = useState(true);
    useEffect(() => {
      const t = setTimeout(() => setShouldAnimate(false), 700);
      return () => clearTimeout(t);
    }, []);

    return (
      <div className={`pt-2 ${SECTION.blockGap}`}>
        {sections.map((section, idx) => {
          const sectionTitle = isActivityFilterKey(section.id)
            ? tDiscover(`page.filters.${section.id}`)
            : tDiscover(`page.sections.${section.id}`);
          const visibleItems =
            capPerSection && section.items.length > capPerSection
              ? section.items.slice(0, capPerSection)
              : section.items;
          const hiddenCount = section.items.length - visibleItems.length;

          return (
          <section
            key={section.id}
            id={section.id}
            ref={idx === 0 ? ref : undefined}
            aria-labelledby={`section-${section.id}`}
            className={`${HUB.sectionPy} ${idx % 2 === 1 ? `bg-sand/50 ${LAYOUT.stickyBarX}` : ""} ${shouldAnimate ? "section-reveal" : ""}`}
            style={shouldAnimate ? { animationDelay: `${idx * 60}ms` } : undefined}
          >
            <h2
              id={`section-${section.id}`}
              tabIndex={idx === 0 ? -1 : undefined}
              className={`${TYPE.sectionTitle} break-words ${SECTION.headingGap}`}
            >
              {sectionTitle}
            </h2>

            {section.items.length === 0 ? (
              <div
                className={`${EMPTY_STATE} ${SECTION.headingGap}`}
                role="status"
                aria-live="polite"
              >
                <p className="text-muted-ink mb-4">
                  {tCommon("discoverEmptyBody")}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <AppLink
                    href="/discover"
                    className={`min-w-[120px] justify-center ${CTA.primaryCompact}`}
                  >
                    {tCommon("allCategories")}
                  </AppLink>
                  <AskAIButton
                    className={`min-w-[120px] justify-center ${CTA.secondaryCompact}`}
                    ariaLabel={tCommon("askAIRecommendationsAria")}
                  />
                </div>
              </div>
            ) : (
              <>
              <div className={`grid sm:grid-cols-2 lg:grid-cols-3 ${HOME.gridGap}`}>
                {visibleItems.map((item) => (
                  <AttractionCard key={item.id} a={item} />
                ))}
              </div>
              {hiddenCount > 0 ? (
                <div className="mt-6">
                  <AppLink
                    href={`/discover?filter=${section.id}`}
                    className={CTA.secondaryCompact}
                    aria-label={tDiscover("page.sections.showAllAria", {
                      count: section.items.length,
                      section: sectionTitle,
                    })}
                  >
                    {tDiscover("page.sections.showAll", { count: section.items.length })}
                  </AppLink>
                </div>
              ) : null}
              {section.trailLinks && section.trailLinks.length > 0 ? (
                <div className={`mt-8 sm:mt-10 ${SECTION.headingGap}`}>
                  <h3 className={`${TYPE.cardTitle} text-charcoal mb-4`}>
                    {tDiscover("page.filters.relatedTrails")}
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {section.trailLinks.map((trail) => (
                      <li key={trail.id}>
                        <AppLink
                          href={trail.href}
                          className={CTA.chipSecondary}
                        >
                          {trail.name}
                        </AppLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {section.seeMore ? (
                <div className="mt-6">
                  <AppLink
                    href={section.seeMore.href}
                    className={CTA.secondaryCompact}
                  >
                    {tDiscover(`page.filters.${section.seeMore.labelKey}`)}
                  </AppLink>
                </div>
              ) : null}
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
