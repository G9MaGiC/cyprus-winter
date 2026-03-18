import type { Metadata } from "next";
import { airports } from "@/data/airport";
import { SITE_URL } from "@/lib/site-url";
import { winterTipsPractical } from "@/data/winter-tips";
import { LAYOUT, CARD, CTA, SECTION } from "@/lib/design-tokens";
import ListPageHero from "@/components/ListPageHero";
import BeforeYouGoChecklist from "@/components/BeforeYouGoChecklist";
import AppLink from "@/components/AppLink";
import { getLocale, getTranslations } from "next-intl/server";

const ogImage = `${SITE_URL}/images/cyprus/cyprus-airport-coast.jpg`;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "airport.page" });
  const title = t("meta.title");
  const description = t("meta.description");
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/airport` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/airport`,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: t("meta.ogAlt") }],
    },
  };
}

const CITY_GREEK: Record<string, string> = {
  Larnaca: "Λάρνακα",
  Paphos: "Πάφος",
};

export default async function AirportPage() {
  const [tNav, tAirport] = await Promise.all([
    getTranslations("nav"),
    getTranslations("airport.page"),
  ]);
  const FIRST_HOUR_STEPS = [
    { step: "1", label: tAirport("firstHour.steps.arrivals") },
    { step: "2", label: tAirport("firstHour.steps.baggage") },
    { step: "3", label: tAirport("firstHour.steps.transport") },
    { step: "4", label: tAirport("firstHour.steps.out") },
  ];
  return (
    <div className="min-h-screen bg-sand">
      <div
        className={`${LAYOUT.listNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePyHeroFirst} flex flex-col gap-10 sm:gap-14`}
      >
        <ListPageHero
          backHref="/"
          backLabel={tNav("home")}
          title={tAirport("hero.title")}
          description={tAirport("hero.description")}
          descriptionSecondary={tAirport("hero.descriptionSecondary")}
          breadcrumbItems={[{ label: tNav("home"), href: "/" }, { label: tNav("arriving"), href: "/airport", isCurrent: true }]}
          backgroundImage="/images/cyprus/cyprus-airport-coast.jpg"
          backgroundImageAlt={tAirport("hero.imageAlt")}
        >
          <AppLink
            href="/plan?template=short-stay"
            className={`${CTA.tertiaryOnDark} mt-4 inline-block`}
            aria-label={tAirport("hero.plan48Aria")}
          >
            {tAirport("hero.plan48Cta")}
          </AppLink>
        </ListPageHero>

        {/* Essentials — tappable numbers for mobile */}
        <section
          aria-labelledby="essentials-heading"
          className={`rounded-xl bg-aegean/10 border border-aegean/30 ${CARD.content}`}
        >
          <h2 id="essentials-heading" className="sr-only">
            {tAirport("essentials.srHeading")}
          </h2>
          <p className="text-aegean font-semibold text-sm">
            <a href="tel:112" className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 rounded">
              {tAirport("essentials.emergency")} <strong>112</strong>
            </a>
            {" · "}
            {tAirport("essentials.touristInfo")} <strong>1460</strong>
            {" · "}
            <a href="tel:199" className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 rounded">
              {tAirport("essentials.ambulance")} <strong>199</strong>
            </a>
          </p>
          <p className="text-olive/70 text-xs mt-1">{tAirport("essentials.note")}</p>
        </section>

        {/* Your first hour — orient jetlagged arrivals */}
        <section aria-labelledby="first-hour-heading" className={`rounded-xl ${CARD.base} ${CARD.content}`}>
          <h2 id="first-hour-heading" className={`font-display font-semibold text-olive ${SECTION.headingGap}`}>
            {tAirport("firstHour.title")}
          </h2>
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-1">
            {FIRST_HOUR_STEPS.map(({ step, label }, i) => (
              <div key={step} className="flex items-center shrink-0 gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta/15 text-terracotta text-sm font-semibold">
                  {step}
                </span>
                <span className="text-olive/90 text-sm font-medium">{label}</span>
                {i < FIRST_HOUR_STEPS.length - 1 && (
                  <span className="text-sand-300 mx-0.5 hidden sm:inline" aria-hidden>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Airport picker — prominent for tired arrivals */}
        <section aria-labelledby="airport-picker-heading">
          <h2 id="airport-picker-heading" className={`font-display font-semibold text-olive ${SECTION.headingGap}`}>
            {tAirport("picker.title")}
          </h2>
          <nav aria-label={tAirport("picker.aria")} className="flex gap-3">
            {airports.map((airport) => (
              <a
                key={airport.code}
                href={`#airport-${airport.code}`}
                className={`flex-1 min-h-[52px] flex items-center justify-center rounded-xl border-2 border-terracotta/40 text-terracotta font-semibold hover:bg-terracotta/10 hover:border-terracotta/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2`}
              >
                {airport.code} — {airport.city}
              </a>
            ))}
          </nav>
        </section>

        {/* Airport sections */}
        <div className="space-y-10">
          {airports.map((airport) => (
            <section
              key={airport.code}
              id={`airport-${airport.code}`}
              aria-labelledby={`airport-${airport.code}-heading`}
              className={`rounded-xl overflow-hidden ${CARD.base} ${CARD.hover} scroll-mt-24`}
            >
              <div className="bg-terracotta text-white px-6 py-5">
                <h2
                  id={`airport-${airport.code}-heading`}
                  className="font-display text-xl sm:text-2xl font-semibold text-white"
                >
                  {airport.code} — {airport.name}
                </h2>
                <p className="text-white/90 text-sm break-words mt-1">
                  {airport.city}
                  {CITY_GREEK[airport.city] && (
                    <span className="ml-1.5 text-white/80">({CITY_GREEK[airport.city]})</span>
                  )}
                </p>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className={`font-display font-semibold text-olive ${SECTION.titleGap}`}>{tAirport("sections.transportTitle")}</h3>
                  <ul className="space-y-3" role="list">
                    {airport.transport.map((t) => (
                      <li
                        key={t.type}
                        className="flex flex-col sm:flex-row sm:items-start gap-2 p-4 rounded-xl bg-sand/50 border border-sand-200/80"
                      >
                        <span
                          className="font-semibold text-terracotta sm:w-28 shrink-0"
                          aria-hidden
                        >
                          {t.type}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-olive/90 text-sm leading-relaxed break-words">
                            {t.description}
                          </p>
                          <p className="text-terracotta font-semibold text-sm mt-1.5 break-words">
                            {t.approxCost}
                          </p>
                          {t.duration && (
                            <p className="text-olive/70 text-xs mt-0.5 break-words">
                              {t.duration}
                            </p>
                          )}
                          {t.tip && (
                            <p className="text-olive/80 text-xs mt-1.5 italic break-words">
                              {t.tip}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className={`font-display font-semibold text-olive ${SECTION.titleGap}`}>{tAirport("sections.tipsTitle")}</h3>
                  <ul className="space-y-2" role="list">
                    {airport.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-sm text-olive/90 leading-relaxed break-words"
                      >
                        <span className="text-terracotta/70 shrink-0" aria-hidden>
                          ·
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Before you go — tickable checklist */}
        <section className={`rounded-xl ${CARD.base} ${CARD.content} bg-sand/60`}>
          <BeforeYouGoChecklist tips={winterTipsPractical} />
        </section>

        {/* Closing — warm, Cyprus Winter voice */}
        <footer className="text-center space-y-6 pb-4">
          <p className="text-olive/80 text-base max-w-lg mx-auto leading-relaxed break-words">
            {tAirport("footer.body")}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
            <AppLink href="/plan?template=short-stay" className={CTA.primaryCompact}>
              {tAirport("hero.plan48Cta")}
            </AppLink>
            <AppLink href="/plan?template=classic-7" className={CTA.secondaryCompact}>
              {tAirport("footer.planWeekCta")}
            </AppLink>
            <AppLink href="/discover" className={CTA.secondaryCompact}>
              {tAirport("footer.discoverCta")}
            </AppLink>
            <AppLink href="/weather" className={CTA.secondaryCompact}>
              {tAirport("footer.weatherCta")}
            </AppLink>
          </div>
        </footer>
      </div>
    </div>
  );
}
