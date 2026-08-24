"use client";

import Image from "next/image";
import AppLink from "@/components/AppLink";
import AIAssistantTrigger from "@/components/AIAssistantTrigger";
import { CTA, HERO, LAYOUT, TYPE } from "@/lib/design-tokens";

export type HomeHeroCopy = {
  imageSrc: string;
  imageObjectPosition?: string;
  imageAlt: string;
  kicker: string;
  title: string;
  headline: string;
  seasonalLine: string;
  familyPicksLabel: string;
  templateLabel: string;
  exploreCta: string;
  planCta: string;
  arrivingCta: string;
  askGuideCta: string;
  discoverAria: string;
  planAria: string;
  airportAria: string;
};

export default function HomeHeroView({
  imageSrc,
  imageObjectPosition,
  imageAlt,
  kicker,
  title,
  headline,
  seasonalLine,
  familyPicksLabel,
  templateLabel,
  exploreCta,
  planCta,
  arrivingCta,
  askGuideCta,
  discoverAria,
  planAria,
  airportAria,
}: HomeHeroCopy) {
  return (
    <section aria-labelledby="hero-heading" className={`${HERO.section} ${LAYOUT.safeAreaX}`}>
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover object-center"
        style={imageObjectPosition ? { objectPosition: imageObjectPosition } : undefined}
        priority
        fetchPriority="high"
        sizes="100vw"
      />
      <div className={HERO.overlay} aria-hidden />

      <div className="relative z-10 w-full max-w-xl mx-auto px-2 sm:px-4">
        <div className={HERO.panel}>
          <p className={`${TYPE.kickerOnDark} mb-3`}>{kicker}</p>
          <h1
            id="hero-heading"
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.05] text-balance mb-3"
          >
            {title}
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto font-light prose-intro text-balance mb-1">
            {headline}
          </p>
          <p className="text-sm text-white/80 max-w-lg mx-auto mb-4 sm:mb-5">{seasonalLine}</p>

          <p className="text-xs sm:text-sm text-center text-white/70 max-w-lg mx-auto mb-4 sm:mb-5 leading-relaxed">
            <AppLink
              href="/discover?filter=family"
              className="text-white/95 underline decoration-white/35 underline-offset-2 hover:decoration-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 rounded-sm"
            >
              {familyPicksLabel}
            </AppLink>
            <span className="text-white/35 mx-2" aria-hidden>
              ·
            </span>
            <AppLink
              href="/plan?template=short-stay"
              className="text-white/95 underline decoration-white/35 underline-offset-2 hover:decoration-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 rounded-sm"
            >
              {templateLabel}
            </AppLink>
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <AppLink
              href="/discover"
              data-testid="home-hero-explore-cta"
              className={`${CTA.primary} w-full sm:w-auto sm:min-w-[160px] justify-center`}
              aria-label={discoverAria}
            >
              {exploreCta}
            </AppLink>
            <AppLink
              href="/plan"
              data-testid="home-hero-plan-cta"
              className={`${CTA.secondary} sm:min-w-[140px] justify-center`}
              aria-label={planAria}
            >
              {planCta}
            </AppLink>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-4 pt-2 border-t border-white/15">
            <AppLink
              href="/airport"
              data-testid="home-hero-airport-cta"
              className={CTA.ghost}
              aria-label={airportAria}
            >
              {arrivingCta}
            </AppLink>
            <AIAssistantTrigger variant="tertiaryOnDark" label={askGuideCta} />
          </div>
        </div>
      </div>
    </section>
  );
}
