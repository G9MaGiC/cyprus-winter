import "server-only";

import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import HomeWeatherStrip from "@/app/_home/HomeWeatherStrip";
import HomeSearchSection from "@/app/_home/HomeSearchSection";
import HomeWhyCyprusTeaser from "@/app/_home/HomeWhyCyprusTeaser";
import HomeTrailConditionsStrip from "@/app/_home/HomeTrailConditionsStrip";
import RightNowNearYou from "@/app/_home/RightNowNearYou";
import StartHereWithExplore from "@/app/_home/StartHereWithExplore";
import HomeTripModeChips from "@/app/_home/HomeTripModeChips";
import TripPlanSummaryChip from "@/components/TripPlanSummaryChip";
import HomePlaceOfDay from "@/app/_home/HomePlaceOfDay";
import HomeSection from "@/app/_home/HomeSection";
import ThisWeekGrid from "@/app/_home/ThisWeekGrid";
import HomePlanningSection from "@/app/_home/HomePlanningSection";
import HomeFooter from "@/app/_home/HomeFooter";
import HomeShareSection from "@/app/_home/HomeShareSection";
import HomeDiscoverySections from "@/app/_home/HomeDiscoverySections";
import EditorsPicks from "@/app/_home/EditorsPicks";
import BookTastings from "@/app/_home/BookTastings";
import {
  BookTastingsSkeleton,
  SearchSectionSkeleton,
  WeatherStripSkeleton,
  ThisWeekSkeleton,
} from "@/app/_home/skeletons";
import { TripModeChipsSkeleton } from "@/app/_home/TripModeChipsSkeleton";
import TripReminderBanner from "@/components/TripReminderBanner";
import HomeSectionReveal from "@/app/_home/HomeSectionReveal";

type HomePageContentProps = {
  sharePath?: string;
  planSubtitle?: string;
  locale?: string;
};

/** Server-only home sections (hero rendered from page shell). */
export default async function HomePageContent({
  sharePath = "/",
  planSubtitle,
  locale,
}: HomePageContentProps) {
  const tHome = locale ? await getTranslations({ locale, namespace: "home" }) : await getTranslations("home");
  const tCommon = locale ? await getTranslations({ locale, namespace: "common" }) : await getTranslations("common");

  return (
    <>
      <div className="bg-background">
        <Suspense fallback={<TripModeChipsSkeleton />}>
          <HomeTripModeChips />
        </Suspense>
        <Suspense fallback={<WeatherStripSkeleton />}>
          <HomeWeatherStrip locale={locale} />
        </Suspense>
      </div>
      <TripReminderBanner />
      <Suspense fallback={<SearchSectionSkeleton />}>
        <HomeSearchSection locale={locale} />
      </Suspense>
      <HomeSectionReveal index={0}>
        <StartHereWithExplore />
      </HomeSectionReveal>
      <div id="plan-sentinel" className="h-px pointer-events-none -mb-px" aria-hidden />
      <HomeSectionReveal index={1}>
        <HomeWhyCyprusTeaser locale={locale} />
      </HomeSectionReveal>
      <Suspense fallback={<WeatherStripSkeleton />}>
        <HomeTrailConditionsStrip locale={locale} />
      </Suspense>
      <HomeSectionReveal index={2}>
        <RightNowNearYou />
      </HomeSectionReveal>
      <HomePlaceOfDay />
      <TripPlanSummaryChip />

      <HomeSection
        id="this-week-heading"
        title={tHome("thisWeek")}
        kicker={tHome("thisWeekSubtitle")}
        subtitle={tHome("thisWeekDesc")}
      >
        <Suspense fallback={<ThisWeekSkeleton />}>
          <ThisWeekGrid locale={locale} />
        </Suspense>
      </HomeSection>

      <HomeDiscoverySections>
        <HomeSection
          id="editors-picks-heading"
          title={tHome("editorsPicks.title")}
          kicker={tHome("editorsPicksKicker")}
          subtitle={tHome("discoverCurated")}
          alt
        >
          <EditorsPicks locale={locale} />
        </HomeSection>

        <HomeSection
          id="book-tastings-heading"
          title={tCommon("bookTastings")}
          kicker={tHome("bookTastings.kicker")}
          subtitle={tHome("bookTastings.subtitle")}
        >
          <Suspense fallback={<BookTastingsSkeleton />}>
            <BookTastings locale={locale} />
          </Suspense>
        </HomeSection>
      </HomeDiscoverySections>

      <HomePlanningSection planSubtitle={planSubtitle} />
      <HomeFooter locale={locale} />
      <Suspense fallback={null}>
        <HomeShareSection sharePath={sharePath} locale={locale} />
      </Suspense>
    </>
  );
}
