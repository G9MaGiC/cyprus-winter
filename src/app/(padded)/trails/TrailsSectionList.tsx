"use client";

import TrailCard from "@/components/TrailCard";
import { trailConditions } from "@/data/trails";
import { HOME, HUB, SECTION, LAYOUT, TYPE } from "@/lib/design-tokens";
import { buildTrailSections } from "@/lib/trails-sections";
import { useTranslations } from "next-intl";

export default function TrailsSectionList() {
  const tSections = useTranslations("trails.sections");
  const sections = buildTrailSections();
  if (sections.length === 0) return null;

  return (
    <div className={`pt-2 ${SECTION.blockGap}`}>
      {sections.map((section, idx) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`trail-section-${section.id}`}
          className={`${HUB.sectionPy} ${idx % 2 === 1 ? `bg-sand/50 ${LAYOUT.stickyBarX}` : ""}`}
        >
          <h2
            id={`trail-section-${section.id}`}
            className={`${TYPE.sectionTitle} break-words ${SECTION.headingGap}`}
          >
            {tSections(section.id)}
          </h2>
          <div className={`grid sm:grid-cols-2 ${HOME.gridGap}`}>
            {section.trails.map((trail) => (
              <TrailCard
                key={trail.id}
                trail={trail}
                conditions={trailConditions[trail.id]}
                featured={false}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
