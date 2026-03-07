import Image from "next/image";
import Link from "next/link";
import AIAssistantTrigger from "@/components/AIAssistantTrigger";
import { CTA, HERO, LAYOUT, TYPE } from "@/lib/design-tokens";

export default function HomeHero() {
  return (
    <section aria-labelledby="hero-heading" className={`${HERO.section} ${LAYOUT.safeAreaX}`}>
      <Image
        src="/images/cyprus/cyprus-ancient-kourion.jpg"
        alt="Kourion ancient theatre, Mediterranean coast, Cyprus winter"
        fill
        className="object-cover object-center"
        priority
        loading="eager"
        sizes="100vw"
      />
      <div className={HERO.overlay} aria-hidden />

      <div className={`relative z-10 w-full ${LAYOUT.form} lg:max-w-3xl mx-auto`}>
        <div className={`${HERO.panel} lg:p-12`}>
          <p className={`${TYPE.kickerOnDark} mb-3`}>The Mediterranean&apos;s best-kept secret</p>
          <h1
            id="hero-heading"
            className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[0.95] mb-4 text-balance"
          >
            Cyprus Winter
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-lg mx-auto font-light mb-2 prose-intro text-balance">
            Real places. Real winters. Discover ruins, trails, villages, heritage—plan as you go.
          </p>
          <p className="text-sm text-white/80 mb-8">Often sixteen degrees when home is six.</p>

          <div className="flex flex-col items-center gap-5 sm:gap-6">
            <Link href="/discover" className={CTA.primary} aria-label="Discover places, villages, and wineries">
              Discover
            </Link>

            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/plan" className={CTA.secondary} aria-label="Build a simple itinerary">
                Plan trip
              </Link>
              <Link href="/airport" className={CTA.ghost} aria-label="Transport from airport, tips">
                Just arrived?
              </Link>
              <AIAssistantTrigger variant="tertiaryOnDark" label="Ask your guide" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

