"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import StickyPlanBar from "@/components/StickyPlanBar";
import { useTranslations } from "next-intl";
import { useOnboardingContext } from "@/contexts/OnboardingContext";
import OnboardingContextualTip from "@/components/OnboardingContextualTip";
import RightNowNearYou from "@/app/_home/RightNowNearYou";
import { LAYOUT } from "@/lib/design-tokens";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { sortDiscoverItemsByInterests } from "@/lib/personalization";
import { filterToSectionId } from "@/lib/discover-sections";
import type { DiscoverSection } from "@/lib/discover-sections";
import DiscoverFilterBar from "./DiscoverFilterBar";
import DiscoverSectionList from "./DiscoverSectionList";
import DiscoverFooter from "./DiscoverFooter";

type DiscoverClientProps = {
  sections: DiscoverSection[];
  children?: React.ReactNode;
};

export default function DiscoverClient({ sections, children }: DiscoverClientProps) {
  const searchParams = useSearchParams();
  const { prefs, hydrated } = useUserPreferences();
  const { showTipDiscoverFilter, dismissTipDiscoverFilter } = useOnboardingContext();
  const t = useTranslations("onboarding");
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

  const firstSectionRef = useRef<HTMLElement | null>(null);
  const hasWineriesInView = sectionsToShow.some((s) =>
    s.items.some((i) => "type" in i && i.type === "winery")
  );

  const totalCount = sectionsToShow.reduce(
    (sum, s) => sum + s.items.length,
    0
  );
  const activeSection = sections.find((s) => s.id === filter);
  const activeSectionTitle =
    filterParam === "nature"
      ? "Nature & coasts"
      : filterParam === "family"
        ? "Family-friendly"
        : activeSection?.title ?? "Places";

  const scrollBehavior = () =>
    (typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      ? "auto"
      : "smooth";

  const scrollToMap = () => {
    document
      .getElementById("discover-map")
      ?.scrollIntoView({ behavior: scrollBehavior() });
  };

  useEffect(() => {
    if (filter && firstSectionRef.current) {
      firstSectionRef.current.scrollIntoView({ behavior: scrollBehavior() });
      const heading = firstSectionRef.current.querySelector("h2");
      if (heading instanceof HTMLElement) {
        heading.focus({ preventScroll: true });
      }
    }
  }, [filter]);

  const filterAnnouncement =
    filter && sectionExists
      ? `Showing ${activeSectionTitle}, ${totalCount} places`
      : "Showing all places";

  return (
    <div
      id="discover-content"
      aria-label="Discover places in Cyprus"
      className="-mt-4 sm:-mt-6"
    >
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {filterAnnouncement}
      </div>
      <StickyPlanBar sentinelId="discover-plan-sentinel" />

      <DiscoverFilterBar
        sections={sections}
        filterParam={filterParam}
        filter={filter}
        sectionExists={!!sectionExists}
        totalCount={totalCount}
        activeSectionTitle={activeSectionTitle}
        hasWineriesInView={hasWineriesInView}
        onScrollToMap={scrollToMap}
      />

      <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} flex flex-col gap-4`}>
        {filter && sectionExists && showTipDiscoverFilter && (
          <OnboardingContextualTip
            message={t("tipDiscoverFilter")}
            onDismiss={dismissTipDiscoverFilter}
          />
        )}
        <p className="pt-6 sm:pt-8 pb-2 text-sm text-olive/70">
          Curated for winter. Add to your plan as you browse.
        </p>

        <DiscoverSectionList ref={firstSectionRef} sections={sectionsToShow} />

        {children}

        <RightNowNearYou title="Near you now" sectionId="discover-right-now" />

        <DiscoverFooter onScrollToMap={scrollToMap} />
      </div>
    </div>
  );
}
