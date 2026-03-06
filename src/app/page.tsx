import Link from "next/link";
import ShareLinks from "@/components/ShareLinks";
import StickyPlanBar from "@/components/StickyPlanBar";
import { CARD, LAYOUT, SECTION } from "@/lib/design-tokens";
import HomeHero from "@/app/_home/HomeHero";
import StartHereStrip from "@/app/_home/StartHereStrip";
import HomeSection from "@/app/_home/HomeSection";
import CategoryChips from "@/app/_home/CategoryChips";
import ThisWeekGrid from "@/app/_home/ThisWeekGrid";
import EditorsPicks from "@/app/_home/EditorsPicks";
import BookTastings from "@/app/_home/BookTastings";
import WhyCyprusDetails from "@/app/_home/WhyCyprusDetails";

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-background">
      <HomeHero />
      <StartHereStrip />
      <div id="plan-sentinel" className="h-px" aria-hidden />
      <StickyPlanBar sentinelId="plan-sentinel" />

      <HomeSection
        id="explore-heading"
        title="Explore"
        subtitle="Villages, wineries, trails, and winter events — start anywhere."
        alt
      >
        <CategoryChips />
      </HomeSection>

      <HomeSection
        id="this-week-heading"
        title="This week"
        subtitle="Coast is often mild; Troodos is cooler. Hike, taste, or see what’s on."
      >
        <ThisWeekGrid />
      </HomeSection>

      <HomeSection
        id="editors-picks-heading"
        title="Editor’s picks"
        subtitle="Four places we keep coming back to in winter. Save them to your plan."
        alt
      >
        <EditorsPicks />
      </HomeSection>

      <HomeSection
        id="book-tastings-heading"
        title="Book tastings"
        subtitle="A few winter-friendly wineries to reserve first."
      >
        <BookTastings />
      </HomeSection>

      {/* Plan + Events — primary actions */}
      <section
        aria-labelledby="planning-heading"
        className={`${SECTION.py} bg-background ${LAYOUT.safeAreaX}`}
      >
        <div className={`${LAYOUT.list} mx-auto`}>
          <h2 id="planning-heading" className="sr-only">
            Planning and essentials
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Link
              href="/plan"
              className={`block p-6 sm:p-8 rounded-xl min-h-[120px] ${CARD.base} border-l-4 border-l-terracotta ${CARD.hover} ${CARD.link} group shadow-sm hover:shadow-md hover:border-terracotta/30 transition-all duration-200`}
            >
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-charcoal group-hover:text-terracotta transition-colors">
                Plan your trip
              </h3>
              <p className="text-sm sm:text-base text-sage mt-2 leading-relaxed">
                Build your itinerary. Add trails and wineries from Discover. Saves as you go.
              </p>
            </Link>
            <Link
              href="/events"
              className={`block p-6 sm:p-8 rounded-xl min-h-[120px] ${CARD.base} border-l-4 border-l-terracotta ${CARD.hover} ${CARD.link} group shadow-sm hover:shadow-md hover:border-terracotta/30 transition-all duration-200`}
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
      </section>

      {/* Why Cyprus — collapsible */}
      <section
        aria-labelledby="why-cyprus-heading"
        className={`${SECTION.py} ${SECTION.alt} ${LAYOUT.safeAreaX}`}
      >
        <div className={`${LAYOUT.list} mx-auto`}>
          <WhyCyprusDetails />
        </div>
      </section>

      {/* Share — home-only (site footer is in layout) */}
      <section
        aria-labelledby="home-share-heading"
        className="bg-charcoal text-white py-16 sm:py-24 pb-[max(3rem,env(safe-area-inset-bottom))] text-center"
      >
        <div className={`${LAYOUT.safeAreaX} ${LAYOUT.listNarrow} mx-auto`}>
          <h2 id="home-share-heading" className="sr-only">
            Share Cyprus Winter
          </h2>
          <p className="text-white/90 font-semibold text-lg">Share Cyprus Winter</p>
          <p className="text-white/80 text-sm mt-3 max-w-lg mx-auto leading-relaxed prose-body">
            Planning ahead or already here? Tap the chat bubble. We&apos;re here to help.
          </p>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider mt-6 mb-2 prose-label">
            Share with friends
          </p>
          <div className="flex justify-center gap-4">
            <ShareLinks
              path="/"
              text="Cyprus Winter — trails, villages, wine. Plan ahead or start exploring when you land."
              ariaLabel="Share via"
              className="share-links-footer"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
