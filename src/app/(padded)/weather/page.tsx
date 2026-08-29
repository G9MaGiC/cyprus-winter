import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { CARD, LAYOUT, PILL, SECTION, TYPE } from "@/lib/design-tokens";
import WeatherPushOptIn from "@/components/WeatherPushOptIn";
import WeatherHubFooter from "@/components/WeatherHubFooter";
import StickyPlanBarBlock from "@/components/StickyPlanBarBlock";
import RightNowNearYou from "@/app/_home/RightNowNearYou";
import { SITE_URL } from "@/lib/site-url";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import PageHeader from "@/components/PageHeader";
import { weatherByMonth } from "@/data/weather";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

const MONTH_TO_SLUG: Record<string, string> = {
  November: "november",
  December: "december",
  January: "january",
  February: "february",
  March: "march",
  April: "april",
};

const ogImage = `${SITE_URL}/images/cyprus/cyprus-ancient-kourion.jpg`;

const weatherAlternates = buildStrategyAAlternates("/weather");

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("weather.page");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: weatherAlternates,
    openGraph: {
      title: t("meta.title"),
      description: t("meta.ogDescription"),
      url: weatherAlternates.canonical,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: t("meta.ogImageAlt") }],
    },
  };
}

function shortSentence(desc: string): string {
  const first = desc.split(".")[0]?.trim() ?? "";
  if (!first) return desc;
  return first.endsWith("!") || first.endsWith("?") ? first : `${first}.`;
}

export default async function WeatherPage() {
  const [tNav, tWeather, tHome] = await Promise.all([
    getTranslations("nav"),
    getTranslations("weather.page"),
    getTranslations("home"),
  ]);

  const monthSelectorSectionClassName = `${SECTION.blockTop} hidden md:block`;
  const mobileClampClass = "text-muted-ink text-xs mt-0.5 line-clamp-1";

  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/"
        backLabel={tNav("home")}
        title={tWeather("title")}
        description={tWeather("description")}
        breadcrumbItems={[{ label: tNav("home"), href: "/" }, { label: tNav("weather"), href: "/weather", isCurrent: true }]}
      />

      {/* Hero guidance block */}
      <section className={SECTION.blockTop}>
        <div className={`${CARD.base} ${CARD.contentLg} bg-sand-100/50`}>
          <p className={`${TYPE.kicker} text-sage`}>{tWeather("hero.kicker")}</p>
          <h2 className={`${TYPE.sectionTitle} mt-2`}>{tWeather("hero.heading")}</h2>
          <p className="text-muted-ink mt-3 max-w-2xl prose-body break-words leading-relaxed">{tWeather("hero.body")}</p>
        </div>
      </section>

      {/* Month selector (hybrid UI) */}
      <section className={monthSelectorSectionClassName} aria-label={tWeather("monthSelector.aria")}>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 sm:-mx-0 sm:px-0 sm:overflow-visible scroll-smooth scroll-touch [-webkit-overflow-scrolling:touch] overscroll-x-contain">
          {weatherByMonth.map((row) => {
            const slug = MONTH_TO_SLUG[row.month];
            if (!slug) return null;
            return (
              <AppLink
                key={row.month}
                href={`/weather/${slug}`}
                className={`${CARD.compact} shrink-0 px-4 py-3 rounded-xl border border-sand-200/80 hover:border-terracotta/30`}
              >
                <div className="flex flex-col">
                  <span className={`${TYPE.cardTitleCompact} text-olive`}>{row.month}</span>
                  <span className="mt-1 text-xs text-muted-ink">
                    {tWeather("table.coast")} {row.coastMinC}–{row.coastMaxC}° · {tWeather("table.troodos")} {row.troodosMinC}–{row.troodosMaxC}°
                  </span>
                </div>
              </AppLink>
            );
          })}
        </div>
      </section>

      {/* Mobile: card layout avoids horizontal scroll */}
      <div className="md:hidden space-y-3">
        {weatherByMonth.map((row) => {
          const slug = MONTH_TO_SLUG[row.month];
          const content = (
              <div className="rounded-xl border border-sand-200/80 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className={`${TYPE.cardTitle}`}>{row.month}</span>
                  {slug && (
                    <span className="text-xs font-medium text-terracotta">
                      {tWeather("mobile.details")}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-ink text-xs">
                      {tWeather("table.coast")}
                    </p>
                    <p className="text-olive font-medium">{row.coastMinC}–{row.coastMaxC}°C</p>
                    <p className={mobileClampClass}>{shortSentence(row.coastDesc)}</p>
                  </div>
                  <div>
                    <p className="text-muted-ink text-xs">
                      {tWeather("table.troodos")}
                    </p>
                    <p className="text-olive font-medium">{row.troodosMinC}–{row.troodosMaxC}°C</p>
                    <p className={mobileClampClass}>{shortSentence(row.troodosDesc)}</p>
                  </div>
                </div>
              </div>
          );
          return slug ? (
            <AppLink key={row.month} href={`/weather/${slug}`} className="block min-h-[44px]">
              {content}
            </AppLink>
          ) : (
            <div key={row.month}>{content}</div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto scroll-smooth scroll-touch [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[600px] border-collapse text-start">
          <thead>
            <tr className="border-b-2 border-sand-200/80">
              <th className={`py-3 px-4 ${TYPE.cardTitle}`}>
                {tWeather("table.month")}
              </th>
              <th
                className={`py-3 px-4 ${TYPE.cardTitle}`}
                scope="col"
              >
                {tWeather("table.coast")}
              </th>
              <th
                className={`py-3 px-4 ${TYPE.cardTitle}`}
                scope="col"
              >
                {tWeather("table.coastConditions")}
              </th>
              <th
                className={`py-3 px-4 ${TYPE.cardTitle}`}
                scope="col"
              >
                {tWeather("table.troodos")}
              </th>
              <th
                className={`py-3 px-4 ${TYPE.cardTitle}`}
                scope="col"
              >
                {tWeather("table.troodosConditions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {weatherByMonth.map((row) => {
              const slug = MONTH_TO_SLUG[row.month];
              return (
              <tr key={row.month} className="border-b border-sand-100">
                <td className="py-4 px-4">
                  {slug ? (
                    <AppLink
                      href={`/weather/${slug}`}
                      className="font-medium text-olive hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded min-h-[44px] inline-flex items-center"
                    >
                      {row.month}
                    </AppLink>
                  ) : (
                    <span className="font-medium text-olive">{row.month}</span>
                  )}
                </td>
                <td className="py-4 px-4 text-olive/90">
                  {row.coastMinC}–{row.coastMaxC}°C
                </td>
                <td className="py-4 px-4 text-sm text-muted-ink max-w-xs">
                  {shortSentence(row.coastDesc)}
                </td>
                <td className="py-4 px-4 text-olive/90">
                  {row.troodosMinC}–{row.troodosMaxC}°C
                </td>
                <td className="py-4 px-4 text-sm text-muted-ink max-w-xs">
                  {shortSentence(row.troodosDesc)}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Discover gateway */}
      <section className={SECTION.blockTop}>
        <h2 className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}>{tWeather("gateway.heading")}</h2>
        <div className="flex flex-wrap gap-3">
          <AppLink href="/trails" className={`${PILL.base} ${PILL.neutral}`}>
            {tNav("trails")}
          </AppLink>
          <AppLink href="/discover?filter=winery" className={`${PILL.base} ${PILL.neutral}`}>
            {tNav("wineries")}
          </AppLink>
          <AppLink href="/discover?filter=village" className={`${PILL.base} ${PILL.neutral}`}>
            {tNav("villages")}
          </AppLink>
          <AppLink href="/discover?filter=monastery" className={`${PILL.base} ${PILL.neutral}`}>
            {tWeather("gateway.monasteries")}
          </AppLink>
          <AppLink href="/discover?filter=hidden" className={`${PILL.base} ${PILL.neutral}`}>
            {tNav("secrets")}
          </AppLink>
          <AppLink href="/events" className={`${PILL.base} ${PILL.neutral}`}>
            {tNav("events")}
          </AppLink>
        </div>
      </section>

      <div className={SECTION.blockTop}>
        <RightNowNearYou title={tHome("rightNowNearYou")} />
      </div>

      <WeatherPushOptIn />

      <div className={`${SECTION.blockTop} space-y-4 text-muted-ink text-sm max-w-2xl`}>
        <p>{tWeather("body.coastTroodos")}</p>
        <p>
          <AppLink href="/trails" className={SECTION.aegeanLink}>
            {tWeather("body.linkTrails")}
          </AppLink>{" "}
          {tWeather("body.linkTrailsSuffix")}{" "}
          <AppLink
            href="/discover?filter=winery"
            className={SECTION.aegeanLink}
          >
            {tWeather("body.linkWineries")}
          </AppLink>{" "}
          {tWeather("body.linkWineriesSuffix")}
        </p>
      </div>

      <span id="weather-plan-sentinel" className="h-px block pointer-events-none" aria-hidden />
      <WeatherHubFooter />
      <StickyPlanBarBlock sentinelId="weather-plan-sentinel" />
    </div>
  );
}
