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

      <div className="relative z-10 w-full max-w-2xl mx-auto px-2 sm:px-4">
        <div className={HERO.panel}>
          <p className={`${TYPE.kickerOnDark} mb-3`}>The Mediterranean&apos;s best-kept secret</p>
          <h1
            id="hero-heading"
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.05] text-balance mb-3"
          >
            Cyprus Winter
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto font-light prose-intro text-balance mb-1">
            Escape the cold. Ruins, trails, villages. Plan as you go.
          </p>
          <p className="text-sm text-white/75 max-w-lg mx-auto mb-6">
            {getSeasonalLine()} Sixteen degrees when home is six.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <AppLink
              href="/discover"
              className={`${CTA.primary} w-full sm:w-auto sm:min-w-[160px] justify-center`}
              aria-label="Discover places, villages, and wineries"
            >
              Explore
            </AppLink>
            <AppLink href="/plan" className={CTA.secondary} aria-label="Build a day or pick a template">
              Plan your trip
            </AppLink>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-4 pt-2 border-t border-white/15">
            <AppLink href="/airport" className={CTA.ghost} aria-label="Transport from airport, tips">
              Just arrived?
            </AppLink>
            <AIAssistantTrigger variant="tertiaryOnDark" label="Ask your guide" />
          </div>
        </div>
      </div>
    </section>
  );
}

