import dynamic from "next/dynamic";
import { Suspense } from "react";
import ShareLinks from "@/components/ShareLinks";
import StickyPlanBar from "@/components/StickyPlanBar";
import BackToTopLink from "@/components/BackToTopLink";
import { CARD, LAYOUT, SECTION, STRIP, TYPE } from "@/lib/design-tokens";
import SearchBar from "@/components/SearchBar";
import HomeHero from "./_home/HomeHero";
import HomeWeatherStrip from "@/app/_home/HomeWeatherStrip";
import StartHereWithExplore from "@/app/_home/StartHereWithExplore";
import HomeSection from "@/app/_home/HomeSection";
import ThisWeekGrid from "@/app/_home/ThisWeekGrid";
import HomeInsiderTip from "@/app/_home/HomeInsiderTip";
import HomePlaceOfDay from "@/app/_home/HomePlaceOfDay";
import HomeTrailConditionsStrip from "@/app/_home/HomeTrailConditionsStrip";
import RightNowNearYou from "@/app/_home/RightNowNearYou";
import WhyCyprusDetails from "@/app/_home/WhyCyprusDetails";

const EditorsPicks = dynamic(() => import("@/app/_home/EditorsPicks"), { loading: () => <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 min-h-[200px]" aria-hidden /> });
const BookTastings = dynamic(() => import("@/app/_home/BookTastings"), { loading: () => <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 min-h-[200px]" aria-hidden /> });
import { RecentlyViewedStrip } from "@/components/RecentlyViewed";
import TripReminderBanner from "@/components/TripReminderBanner";
import { Link } from "@/i18n/navigation";

function WeatherStripSkeleton() {
  return (
    <section
      aria-hidden
      className={`${LAYOUT.safeAreaX} ${STRIP.py} bg-sand/60 border-b border-sand-200/80`}
    >
      <div className={`${LAYOUT.list} mx-auto flex justify-center`}>
        <div className="h-6 w-40 bg-olive/20 rounded animate-pulse" />
      </div>
    </section>
  );
}

function ThisWeekSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" aria-hidden>
      {[1, 2, 3].map((i) => (
        <div key={i} className={`${CARD.content} ${CARD.base} border-l-4 border-l-aegean/30`}>
          <div className="h-4 w-20 bg-olive/20 rounded mb-2" />
          <div className="h-8 w-32 bg-olive/30 rounded mt-1" />
          <div className="h-4 w-full bg-sand-200/80 rounded mt-2" />
        </div>
      ))}
    </div>
  );
}

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="relative overflow-hidden bg-background">
      <HomeHero />
      <Suspense fallback={<WeatherStripSkeleton />}>
        <HomeWeatherStrip />
      </Suspense>
      <TripReminderBanner />
      <section aria-labelledby="home-search-heading" className={`${LAYOUT.safeAreaX} ${SECTION.pySub}`}>
        <div className={`${LAYOUT.list} mx-auto`}>
          <h2 id="home-search-heading" className={`${TYPE.sectionTitle} text-center text-olive mb-3`}>
            Where to today?
          </h2>
          <SearchBar placeholder="Find a place, trail, or event" className="max-w-xl mx-auto" />
        </div>
      </section>
      <HomeTrailConditionsStrip />
      <StartHereWithExplore />
      <RightNowNearYou />
      <RecentlyViewedStrip />
      <div id="plan-sentinel" className="h-px pointer-events-none -mb-px" aria-hidden />
      <HomePlaceOfDay />

      <HomeSection
        id="this-week-heading"
        title="This week"
        subtitle="Coast is often mild; Troodos is cooler. Hike, taste, or see what's on."
      >
        <Suspense fallback={<ThisWeekSkeleton />}>
          <ThisWeekGrid />
        </Suspense>
      </HomeSection>

      <HomeSection
        id="editors-picks-heading"
        title="Editor's picks"
        subtitle="Our team's favorites. Save them to your plan."
        alt
      >
        <EditorsPicks />
      </HomeSection>

      <HomeSection
        id="book-tastings-heading"
        title="Book tastings"
        subtitle="Winter-friendly wineries. Reserve ahead for weekends."
      >
        <BookTastings />
      </HomeSection>

      <section
        aria-labelledby="planning-heading"
        className={`${SECTION.py} bg-background ${LAYOUT.safeAreaX} relative`}
      >
        <div className={`${LAYOUT.list} mx-auto`}>
          <h2 id="planning-heading" className="sr-only">
            Planning and essentials
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Link
              href="/plan"
              prefetch="auto"
              className={`block ${CARD.contentLg} min-h-[120px] ${CARD.base} border-l-4 border-l-terracotta ${CARD.hover} ${CARD.link} group shadow-sm hover:shadow-lg hover:border-terracotta/30 transition-all duration-200`}
            >
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-charcoal group-hover:text-terracotta transition-colors">
                Plan your trip
              </h3>
              <p className="text-sm sm:text-base text-sage mt-2 leading-relaxed">
                Build your itinerary. Add places from Discover—saves as you go.
              </p>
            </Link>
            <Link
              href="/events"
              prefetch="auto"
              className={`block ${CARD.contentLg} min-h-[120px] ${CARD.base} border-l-4 border-l-terracotta ${CARD.hover} ${CARD.link} group shadow-sm hover:shadow-lg hover:border-terracotta/30 transition-all duration-200`}
            >
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-charcoal group-hover:text-terracotta transition-colors">
                Winter events
              </h3>
              <p className="text-sm sm:text-base text-sage mt-2 leading-relaxed">
                Epiphany, carnival, tastings. What&apos;s on when.
              </p>
            </Link>
          </div>
        </div>
        <StickyPlanBar sentinelId="plan-sentinel" />
      </section>

      <HomeInsiderTip />

      <section
        aria-labelledby="why-cyprus-heading"
        className={`${SECTION.py} ${SECTION.alt} ${LAYOUT.safeAreaX}`}
      >
        <div className={`${LAYOUT.list} mx-auto`}>
          <WhyCyprusDetails />
        </div>
      </section>

      <section
        aria-labelledby="home-share-heading"
        className={`bg-charcoal text-white ${SECTION.py} pb-[max(3rem,env(safe-area-inset-bottom))] text-center`}
      >
        <div className={`${LAYOUT.safeAreaX} ${LAYOUT.listNarrow} mx-auto`}>
          <h2 id="home-share-heading" className="sr-only">
            Share Cyprus Winter
          </h2>
          <p className="text-white/90 font-semibold text-lg">Share Cyprus Winter</p>
          <p className="text-white/80 text-sm mt-3 max-w-lg mx-auto leading-relaxed prose-body">
            Planning ahead or already here? Tap the chat bubble. Add places as you browse—your plan saves automatically.
          </p>
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider mt-6 mb-2 prose-label">
            Share with someone heading to Cyprus
          </p>
          <div className="flex justify-center gap-4">
            <ShareLinks
              path={`/${locale}`}
              text="Cyprus Winter — the Mediterranean's best-kept secret. Trails, villages, heritage. Often sixteen degrees when home is six."
              ariaLabel="Share via"
              className="share-links-footer"
            />
          </div>
          <div className="mt-6 pt-4 border-t border-white/20">
            <BackToTopLink />
          </div>
        </div>
      </section>
    </div>
  );
}
