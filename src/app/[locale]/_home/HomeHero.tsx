import Image from "next/image";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import AIAssistantTrigger from "@/components/AIAssistantTrigger";
import { CTA, HERO, LAYOUT, TYPE } from "@/lib/design-tokens";

export default async function HomeHero() {
  const t = await getTranslations();
  return (
    <section aria-labelledby="hero-heading" className={`${HERO.section} ${LAYOUT.safeAreaX}`}>
      <Image
        src="/images/cyprus/cyprus-ancient-kourion.jpg"
        alt={t("ui.hero.imageAlt")}
        fill
        className="object-cover object-center"
        priority
        loading="eager"
        sizes="100vw"
      />
      <div className={HERO.overlay} aria-hidden />

      <div className={`relative z-10 w-full ${LAYOUT.form} lg:max-w-3xl mx-auto`}>
        <div className={`${HERO.panel} lg:p-12`}>
          <p className={`${TYPE.kickerOnDark} mb-3`}>{t("ui.app__home_HomeHero.text_13")}</p>
          <h1
            id="hero-heading"
            className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[0.95] mb-4 text-balance"
          >
            {t("ui.app__home_HomeHero.text_14")}
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-lg mx-auto font-light mb-2 prose-intro text-balance">
            {t("ui.app__home_HomeHero.text_subtitle")}
          </p>
          <p className="text-sm text-white/80 mb-10">
            {t("ui.app__home_HomeHero.text_16")}
          </p>

          <div className="flex flex-col items-center gap-4 sm:gap-5">
            <Link href="/discover" className={CTA.primary} aria-label={t("ui.app__home_HomeHero.aria-label_10")}>
              {t("common.nav.discover")}
            </Link>

            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-sm">
              <Link
                href="/plan"
                className="text-white/80 hover:text-sage min-h-[44px] px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/60 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                aria-label={t("ui.app__home_HomeHero.aria-label_11")}
              >
                {t("common.nav.trip")}
              </Link>
              <Link
                href="/airport"
                className="text-white/80 hover:text-sage min-h-[44px] px-3 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/60 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                aria-label={t("ui.app__home_HomeHero.aria-label_12")}
              >
                {t("common.nav.airport")}
              </Link>
              <AIAssistantTrigger variant="tertiaryOnDark" label="Ask your guide" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

