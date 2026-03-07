import Image from "next/image";
import AppLink from "@/components/AppLink";
import AIAssistantTrigger from "@/components/AIAssistantTrigger";
import { CTA, HERO, LAYOUT, TYPE } from "@/lib/design-tokens";

function getSeasonalLine(): string {
  const m = new Date().getMonth();
  if (m >= 10) return "Coast mild. Trails clear. Best for hiking.";
  if (m <= 2) return "Coast mild. Troodos with snow. Pack layers.";
  if (m === 3) return "Best hiking month. Trails open.";
  return "Coast mild. Mountains cooler. Plan as you go.";
}

export default function HomeHero() {
  return (
    <section aria-labelledby="hero-heading" className={`${HERO.section} ${LAYOUT.safeAreaX}`}>
      <Image
        src="/images/cyprus/cyprus-ancient-kourion.jpg"
        alt="Kourion ancient theatre, Mediterranean coast, Cyprus winter"
        fill
        className="object-cover object-center"
        priority
        fetchPriority="high"
        sizes="100vw"
      />
      <div className={HERO.overlay} aria-hidden />

      <div className={`relative z-10 w-full ${LAYOUT.form} lg:max-w-3xl mx-auto`}>
        <div className={`${HERO.panel} lg:p-12`}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <p className={`${TYPE.kickerOnDark}`}>The Mediterranean&apos;s best-kept secret</p>
            <span className="text-xs font-medium uppercase tracking-wider text-golden/90 bg-golden/20 px-2.5 py-0.5 rounded-md">
              Winter 2026
            </span>
          </div>
          <h1
            id="hero-heading"
            className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[0.95] mb-4 text-balance"
          >
            Cyprus Winter
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-lg mx-auto font-light mb-2 prose-intro text-balance">
            Real places. Real winters. Discover ruins, trails, villages, heritage—plan as you go.
          </p>
          <p className="text-sm text-white/80 mb-1">{getSeasonalLine()}</p>
          <p className="text-sm text-white/70 mb-8">Often sixteen degrees when home is six.</p>

          <div className="flex flex-col items-center gap-5 sm:gap-6">
            <AppLink href="/discover" className={CTA.primary} aria-label="Discover places, villages, and wineries">
              Explore winter
            </AppLink>

            <div className="flex flex-wrap justify-center gap-3">
              <AppLink href="/plan" className={CTA.secondary} aria-label="Build a simple itinerary">
                Plan trip
              </AppLink>
              <AppLink href="/airport" className={CTA.ghost} aria-label="Transport from airport, tips">
                Just arrived?
              </AppLink>
              <AIAssistantTrigger variant="tertiaryOnDark" label="Ask your guide" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

