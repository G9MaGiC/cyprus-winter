"use client";

import TrailCard from "@/components/TrailCard";
import { trailConditions } from "@/data/trails";
import { SECTION, TYPE } from "@/lib/design-tokens";
import type { Trail } from "@/data/trails";

type BestConditionsNowProps = {
  trails: Trail[];
};

export default function BestConditionsNow({ trails }: BestConditionsNowProps) {
  if (trails.length === 0) return null;

  return (
    <section
      aria-labelledby="best-now"
      role="complementary"
      className={`${SECTION.pySub} pl-6 sm:pl-8 border-l-4 border-sage/50`}
    >
      <h2 id="best-now" className={`${TYPE.sectionTitle} text-xl sm:text-2xl ${SECTION.headingGap}`}>
        Best conditions now
      </h2>
      <div className="flex gap-3 overflow-x-auto scroll-smooth scroll-touch pb-2 -mx-[max(1.5rem,env(safe-area-inset-left))] px-[max(1.5rem,env(safe-area-inset-left))] sm:mx-0 sm:px-0 scrollbar-none snap-x snap-mandatory sm:grid sm:grid-cols-3 sm:overflow-visible sm:snap-none sm:gap-6">
        {trails.map((trail) => (
          <div key={trail.id} className="shrink-0 w-[85vw] max-w-[320px] sm:w-auto sm:max-w-none snap-start">
            <TrailCard trail={trail} conditions={trailConditions[trail.id]} featured />
          </div>
        ))}
      </div>
    </section>
  );
}
