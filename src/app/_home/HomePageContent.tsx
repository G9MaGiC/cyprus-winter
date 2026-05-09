import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { ComponentType } from "react";
import AppLink from "@/components/AppLink";
import HomeHero from "@/app/_home/HomeHero";
import HomeWeatherStrip from "@/app/_home/HomeWeatherStrip";
import HomeSearchSection from "@/app/_home/HomeSearchSection";
import HomeWhyCyprusTeaser from "@/app/_home/HomeWhyCyprusTeaser";
import HomeTrailConditionsStrip from "@/app/_home/HomeTrailConditionsStrip";
import RightNowNearYou from "@/app/_home/RightNowNearYou";
import StartHereWithExplore from "@/app/_home/StartHereWithExplore";
import HomePlaceOfDay from "@/app/_home/HomePlaceOfDay";
import HomeSection from "@/app/_home/HomeSection";
import ThisWeekGrid from "@/app/_home/ThisWeekGrid";
import HomePlanningSection from "@/app/_home/HomePlanningSection";
import HomeFooter from "@/app/_home/HomeFooter";
import HomeShareSection from "@/app/_home/HomeShareSection";
import {
  EditorsPicksSkeleton,
  BookTastingsSkeleton,
  WeatherStripSkeleton,
  ThisWeekSkeleton,
} from "@/app/_home/skeletons";
import { RecentlyViewedStrip } from "@/components/RecentlyViewed";
import TripReminderBanner from "@/components/TripReminderBanner";
import { useTranslations } from "next-intl";

const EditorsPicks = dynamic(() => import("@/app/_home/EditorsPicks"), {
  loading: EditorsPicksSkeleton,
});
const BookTastings = dynamic(() => import("@/app/_home/BookTastings"), {
  loading: BookTastingsSkeleton,
});

import type { LinkProps } from "@/app/_home/types";

type HomePageContentProps = {
  sharePath?: string;
  LinkComponent?: ComponentType<LinkProps>;
  planSubtitle?: string;
};

export default function HomePageContent({
  sharePath = "/",
  LinkComponent = AppLink,
  planSubtitle,
}: HomePageContentProps = {}) {
  const tHome = useTranslations("home");
  const tCommon = useTranslations("common");
  return (
    <div className="relative overflow-hidden bg-background">
      <nav
        aria-label={tCommon("skipToContent")}
        className="absolute left-4 top-4 z-[45] flex -translate-y-full flex-col gap-2 rounded-lg border border-sand-200 bg-white p-2 shadow-lg transition-transform focus-within:translate-y-0 focus-within:outline-none focus-within:ring-2 focus-within:ring-terracotta focus-within:ring-offset-2"
      >
        <AppLink
          href="#this-week-heading"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 py-2 font-medium text-terracotta hover:bg-terracotta/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
        >
          Skip to This week
        </AppLink>
        <AppLink
          href="#editors-picks-heading"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 py-2 font-medium text-terracotta hover:bg-terracotta/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
        >
          {tCommon("skipTo.editorsPicks")}
        </AppLink>
        <AppLink
          href="#planning-section"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 py-2 font-medium text-terracotta hover:bg-terracotta/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
        >
          {tCommon("skipTo.plan")}
        </AppLink>
      </nav>
      <HomeHero />
      <Suspense fallback={<WeatherStripSkeleton />}>
        <HomeWeatherStrip LinkComponent={LinkComponent} />
      </Suspense>
      <TripReminderBanner />
      <HomeSearchSection />
      <HomeWhyCyprusTeaser />
      <HomeTrailConditionsStrip LinkComponent={LinkComponent} />
      <StartHereWithExplore LinkComponent={LinkComponent} />
      <RightNowNearYou />
      <RecentlyViewedStrip />
      <HomePlaceOfDay LinkComponent={LinkComponent} />
      <div id="plan-sentinel" className="h-px pointer-events-none -mb-px" aria-hidden />

      <HomeSection
        id="this-week-heading"
        title={tHome("thisWeek")}
        kicker={tHome("thisWeekSubtitle")}
        subtitle={tHome("thisWeekDesc")}
      >
        <Suspense fallback={<ThisWeekSkeleton />}>
          <ThisWeekGrid LinkComponent={LinkComponent} />
        </Suspense>
      </HomeSection>

      <HomeSection
        id="editors-picks-heading"
        title={tHome("editorsPicks")}
        kicker={tHome("editorsPicksKicker")}
        subtitle={tHome("discoverCurated")}
        alt
      >
        <EditorsPicks LinkComponent={LinkComponent} />
      </HomeSection>

      <HomeSection
        id="book-tastings-heading"
        title={tCommon("bookTastings")}
        kicker={tHome("bookTastings.kicker")}
        subtitle={tHome("bookTastings.subtitle")}
      >
        <BookTastings LinkComponent={LinkComponent} />
      </HomeSection>

      <HomePlanningSection LinkComponent={LinkComponent} planSubtitle={planSubtitle} />
      <HomeFooter LinkComponent={LinkComponent} />
      <HomeShareSection sharePath={sharePath} />
    </div>
  );
}
