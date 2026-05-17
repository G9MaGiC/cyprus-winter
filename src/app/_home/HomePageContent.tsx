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
import EditorsPicks from "@/app/_home/EditorsPicks";
import BookTastings from "@/app/_home/BookTastings";
import {
  BookTastingsSkeleton,
  WeatherStripSkeleton,
  ThisWeekSkeleton,
} from "@/app/_home/skeletons";
import { RecentlyViewedStrip } from "@/components/RecentlyViewed";
import TripReminderBanner from "@/components/TripReminderBanner";

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
  const [tHome, tCommon] = await Promise.all([
    locale ? getTranslations({ locale, namespace: "home" }) : getTranslations("home"),
    locale ? getTranslations({ locale, namespace: "common" }) : getTranslations("common"),
  ]);

  return (
    <>
      <HomeTripModeChips />
      <Suspense fallback={<WeatherStripSkeleton />}>
        <HomeWeatherStrip locale={locale} />
      </Suspense>
      <TripReminderBanner />
      <StartHereWithExplore />
      <Suspense fallback={null}>
        <HomeSearchSection locale={locale} />
      </Suspense>
      <HomeWhyCyprusTeaser locale={locale} />
      <Suspense fallback={null}>
        <HomeTrailConditionsStrip locale={locale} />
      </Suspense>
      <RightNowNearYou />
      <RecentlyViewedStrip />
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

      <HomeSection
        id="editors-picks-heading"
        title={tHome("editorsPicks")}
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
          <BookTastings />
        </Suspense>
      </HomeSection>

      <div id="plan-sentinel" className="h-px pointer-events-none -mb-px" aria-hidden />
      <HomePlanningSection planSubtitle={planSubtitle} />
      <HomeFooter locale={locale} />
      <Suspense fallback={null}>
        <HomeShareSection sharePath={sharePath} locale={locale} />
      </Suspense>
    </>
  );
}
