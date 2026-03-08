import dynamic from "next/dynamic";
import { Suspense } from "react";
import AppLink from "@/components/AppLink";
import ShareLinks from "@/components/ShareLinks";
import StickyPlanBar from "@/components/StickyPlanBar";
import BackToTopLink from "@/components/BackToTopLink";
import { CARD, LAYOUT, SECTION, SKELETON, STRIP } from "@/lib/design-tokens";
import SearchBar from "@/components/SearchBar";
import HomeHero from "@/app/_home/HomeHero";
import HomeWeatherStrip from "@/app/_home/HomeWeatherStrip";
import StartHereWithExplore from "@/app/_home/StartHereWithExplore";
import HomeTemplateLinks from "@/app/_home/HomeTemplateLinks";
import HomeSection from "@/app/_home/HomeSection";
import ThisWeekGrid from "@/app/_home/ThisWeekGrid";
import HomeInsiderTip from "@/app/_home/HomeInsiderTip";
import HomePlaceOfDay from "@/app/_home/HomePlaceOfDay";
import HomeTrailConditionsStrip from "@/app/_home/HomeTrailConditionsStrip";
import RightNowNearYou from "@/app/_home/RightNowNearYou";

function EditorsPicksSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" aria-hidden>
      {[1, 2].map((i) => (
        <div key={i} className={`${CARD.base} overflow-hidden`}>
          <div className={`${SKELETON.media} rounded-t-xl`} />
          <div className={`${CARD.content} space-y-2`}>
            <div className={`h-5 w-3/4 ${SKELETON.block}`} />
            <div className={`h-4 w-full ${SKELETON.block}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
function BookTastingsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" aria-hidden>
      {[1, 2, 3].map((i) => (
        <div key={i} className={`${CARD.base} overflow-hidden`}>
          <div className={`${SKELETON.media} rounded-t-xl`} />
          <div className={`${CARD.content} space-y-2`}>
            <div className={`h-5 w-2/3 ${SKELETON.block}`} />
            <div className={`h-4 w-full ${SKELETON.block}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

const EditorsPicks = dynamic(() => import("@/app/_home/EditorsPicks"), { loading: EditorsPicksSkeleton });
const BookTastings = dynamic(() => import("@/app/_home/BookTastings"), { loading: BookTastingsSkeleton });
import WhyCyprusDetails from "@/app/_home/WhyCyprusDetails";
import { RecentlyViewedStrip } from "@/components/RecentlyViewed";
import TripReminderBanner from "@/components/TripReminderBanner";

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

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-background">
      <HomeHero />
      <Suspense fallback={<WeatherStripSkeleton />}>
        <HomeWeatherStrip />
      </Suspense>
      <TripReminderBanner />
      <section
        aria-labelledby="home-search-heading"
        className={`${LAYOUT.safeAreaX} py-8 sm:py-10 bg-background`}
      >
        <div className={`${LAYOUT.list} mx-auto`}>
          <h2 id="home-search-heading" className="sr-only">
            Search places and trails
          </h2>
          <div className="max-w-xl mx-auto">
            <p className="text-center text-sage text-sm font-medium uppercase tracking-wider mb-3 prose-label">
              Where to today?
            </p>
            <SearchBar placeholder="Find a place, trail, or event" className="w-full" />
          </div>
        </div>
      </section>
      <HomeTrailConditionsStrip />
      <RightNowNearYou />
      <RecentlyViewedStrip />
      <StartHereWithExplore />
      <HomePlaceOfDay />
      <div id="plan-sentinel" className="h-px pointer-events-none -mb-px" aria-hidden />

      <HomeSection
        id="this-week-heading"
        title="This week"
        kicker="Weather · trails · events"
        subtitle="Coast mild; Troodos cooler. Hike, taste, or see what’s on."
      >
        <Suspense fallback={<ThisWeekSkeleton />}>
          <ThisWeekGrid />
        </Suspense>
      </HomeSection>

      <HomeSection
        id="editors-picks-heading"
        title="Editor’s picks"
        kicker="Curated"
        subtitle="Our favorites. Add to your plan."
        alt
      >
        <EditorsPicks />
      </HomeSection>

      <HomeSection
        id="book-tastings-heading"
        title="Book tastings"
        kicker="Wineries"
        subtitle="Reserve ahead for weekends."
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
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
            <AppLink
              href="/plan"
              className={`block rounded-2xl ${CARD.contentLg} min-h-[120px] ${CARD.base} border-l-4 border-l-terracotta ${CARD.hover} ${CARD.link} group`}
            >
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-charcoal group-hover:text-terracotta transition-colors">
                Plan your trip
              </h3>
              <p className="text-sm sm:text-base text-olive/80 mt-2 leading-relaxed">
                Build a day or pick a template. Saves as you go.
              </p>
            </AppLink>
            <AppLink
              href="/events"
              className={`block rounded-2xl ${CARD.contentLg} min-h-[120px] ${CARD.base} border-l-4 border-l-terracotta ${CARD.hover} ${CARD.link} group`}
            >
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-charcoal group-hover:text-terracotta transition-colors">
                Winter events
              </h3>
              <p className="text-sm sm:text-base text-olive/80 mt-2 leading-relaxed">
                Epiphany, carnival, tastings. What&apos;s on when.
              </p>
            </AppLink>
          </div>
        </div>
        <StickyPlanBar sentinelId="plan-sentinel" />
      </section>

      <footer role="contentinfo" className={`${SECTION.alt} ${LAYOUT.safeAreaX}`}>
        <div className={`${LAYOUT.list} mx-auto ${SECTION.blockGap}`}>
          <div className={`${SECTION.py}`}>
            <WhyCyprusDetails />
          </div>
          <div className={`${SECTION.pySub} pt-0`}>
            <HomeInsiderTip />
          </div>
          <div className={`${SECTION.pySub} pt-0`}>
            <HomeTemplateLinks />
          </div>
        </div>
      </footer>

      {/* Share — home-only (site footer is in layout) */}
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
              path="/"
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
