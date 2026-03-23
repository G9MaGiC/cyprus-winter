import Image from "next/image";
import AppLink from "@/components/AppLink";
import AIAssistantTrigger from "@/components/AIAssistantTrigger";
import { CTA, HERO, LAYOUT, TYPE } from "@/lib/design-tokens";
import { getTranslations } from "next-intl/server";

function getSeasonalKey(): "lateYear" | "earlyYear" | "march" | "spring" {
  const m = new Date().getMonth();
  if (m >= 10) return "lateYear";
  if (m <= 2) return "earlyYear";
  if (m === 3) return "march";
  return "spring";
}

export default async function HomeHero() {
  const tHome = await getTranslations("home");
  return (
    <section aria-labelledby="hero-heading" className={`${HERO.section} ${LAYOUT.safeAreaX}`}>
      <Image
        src="/images/cyprus/cyprus-ancient-kourion.jpg"
        alt={tHome("hero.imageAlt")}
        fill
        className="object-cover object-center"
        priority
        fetchPriority="high"
        sizes="100vw"
      />
      <div className={HERO.overlay} aria-hidden />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-2 sm:px-4">
        <div className={HERO.panel}>
          <p className={`${TYPE.kickerOnDark} mb-3`}>{tHome("kicker")}</p>
          <h1
            id="hero-heading"
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.05] text-balance mb-3"
          >
            {tHome("title")}
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto font-light prose-intro text-balance mb-1">
            {tHome("headline")}
          </p>
          <p className="text-sm text-white/80 max-w-lg mx-auto mb-6">
            {tHome(`seasonal.${getSeasonalKey()}`)} {tHome("degreesLine")}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <AppLink
              href="/discover"
              data-testid="home-hero-explore-cta"
              className={`${CTA.primary} w-full sm:w-auto sm:min-w-[160px] justify-center`}
              aria-label={tHome("aria.discover")}
            >
              {tHome("cta.explore")}
            </AppLink>
            <AppLink
              href="/plan"
              data-testid="home-hero-plan-cta"
              className={`${CTA.secondary} sm:min-w-[140px] justify-center`}
              aria-label={tHome("aria.plan")}
            >
              {tHome("cta.planTrip")}
            </AppLink>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-5 pt-2 border-t border-white/15">
            <AppLink
              href="/airport"
              data-testid="home-hero-airport-cta"
              className={CTA.ghost}
              aria-label={tHome("aria.airport")}
            >
              {tHome("cta.arriving")}
            </AppLink>
            <AIAssistantTrigger variant="tertiaryOnDark" label={tHome("cta.askGuide")} />
          </div>
        </div>
      </div>
    </section>
  );
}

