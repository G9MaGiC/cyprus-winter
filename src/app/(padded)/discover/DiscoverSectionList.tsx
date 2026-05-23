"use client";

import { forwardRef, useEffect, useState } from "react";
import AppLink from "@/components/AppLink";
import AttractionCard from "@/components/AttractionCard";
import { OPEN_AI_EVENT } from "@/components/AIAssistantTrigger";
import { SECTION, CTA, EMPTY_STATE, LAYOUT, TYPE } from "@/lib/design-tokens";
import type { DiscoverSection } from "@/lib/discover-sections";
import { isActivityFilterKey } from "@/lib/activity-catalog";
import { useTranslations } from "next-intl";

type DiscoverSectionListProps = {
  sections: DiscoverSection[];
};

const DiscoverSectionList = forwardRef<HTMLElement | null, DiscoverSectionListProps>(
  function DiscoverSectionList({ sections }, ref) {
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
              {sectionTitle}
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
                {section.items.map((item) => (
                  <AttractionCard key={item.id} a={item} />
                ))}
              </div>
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
