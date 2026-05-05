import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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
        fetchPriority="high"
        sizes="100vw"
      />
      <div className={HERO.overlay} aria-hidden />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-2 sm:px-4">
        <div className={HERO.panel}>
          <p className={`${TYPE.kickerOnDark} mb-3`}>{t("ui.app__home_HomeHero.text_13")}</p>
          <h1
            id="hero-heading"
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.05] text-balance mb-3"
          >
            {t("ui.app__home_HomeHero.text_14")}
          </h1>
          <p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto font-light prose-intro text-balance mb-1">
            {t("ui.app__home_HomeHero.text_subtitle")}
          </p>
          <p className="text-sm text-white/75 max-w-lg mx-auto mb-6">
            {t("ui.app__home_HomeHero.text_16")}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <Link href="/discover" className={`${CTA.primary} w-full sm:w-auto sm:min-w-[160px] justify-center`} aria-label={t("ui.app__home_HomeHero.aria-label_10")}>
                {t("common.nav.discover")}
              </Link>
              <Link href="/plan" className={CTA.secondary} aria-label={t("ui.app__home_HomeHero.aria-label_11")}>
                {t("common.nav.trip")}
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-4 pt-2 border-t border-white/15 text-sm">
              <Link href="/airport" className={CTA.ghost} aria-label={t("ui.app__home_HomeHero.aria-label_12")}>
                {t("common.nav.airport")}
              </Link>
              <AIAssistantTrigger variant="tertiaryOnDark" label="Ask your guide" />
            </div>
        </div>
      </div>
    </section>
  );
}

