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

      <div className="relative z-10 w-full max-w-2xl mx-auto px-1">
        <div className={HERO.panel}>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mb-4">
            <p className={TYPE.kickerOnDark}>The Mediterranean&apos;s best-kept secret</p>
            <span className="text-xs font-medium uppercase tracking-wider text-golden/90 bg-golden/20 px-2.5 py-0.5 rounded-md">
              Winter 2026
            </span>
          </div>
          <h1
            id="hero-heading"
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[0.95] text-balance mb-4"
          >
            Cyprus Winter
          </h1>
          <p className="text-base sm:text-lg text-white/95 max-w-xl mx-auto font-light prose-intro text-balance mb-2">
            Real places. Real winters. Discover ruins, trails, villages, heritage—plan as you go.
          </p>
          <p className="text-sm text-white/80 max-w-lg mx-auto mb-6">
            {getSeasonalLine()} Often sixteen degrees when home is six.
          </p>

          <div className="flex flex-col items-center gap-4 sm:gap-5">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto sm:flex-wrap sm:justify-center">
              <AppLink href="/discover" className={`${CTA.primary} w-full sm:w-auto`} aria-label="Discover places, villages, and wineries">
                Explore winter
              </AppLink>
              <AppLink href="/plan" className={CTA.secondary} aria-label="Build a day or pick a template">
                Plan your trip
              </AppLink>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
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

