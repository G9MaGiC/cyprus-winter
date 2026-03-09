"use client";

import { forwardRef, useEffect, useState } from "react";
import Link from "next/link";
import AttractionCard from "@/components/AttractionCard";
import { OPEN_AI_EVENT } from "@/components/AIAssistantTrigger";
import { SECTION, CTA, EMPTY_STATE, LAYOUT, TYPE } from "@/lib/design-tokens";
import type { DiscoverSection } from "@/lib/discover-sections";

type DiscoverSectionListProps = {
  sections: DiscoverSection[];
};

const DiscoverSectionList = forwardRef<HTMLElement | null, DiscoverSectionListProps>(
  function DiscoverSectionList({ sections }, ref) {
    const [shouldAnimate, setShouldAnimate] = useState(true);
    useEffect(() => {
      const t = setTimeout(() => setShouldAnimate(false), 700);
      return () => clearTimeout(t);
    }, []);

    return (
      <div className={`pt-2 ${SECTION.blockGap}`}>
        {sections.map((section, idx) => (
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
                  No places here. Try another filter or ask the AI—it knows the island.
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
                    aria-label="Ask AI for recommendations"
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
    );
  }
);

export default DiscoverSectionList;
