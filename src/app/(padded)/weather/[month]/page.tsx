import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { notFound } from "next/navigation";
import { CARD, CTA, LAYOUT, PILL, SECTION, TYPE } from "@/lib/design-tokens";
import { SITE_URL } from "@/lib/site-url";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import PageHeader from "@/components/PageHeader";
import { weatherByMonth } from "@/data/weather";
import { winterEvents } from "@/data/events";
import WeatherMonthFooter from "@/components/WeatherMonthFooter";
import { getTranslations } from "next-intl/server";
import WeatherPushOptIn from "@/components/WeatherPushOptIn";
import RightNowNearYou from "@/app/_home/RightNowNearYou";
import { getWeatherMonthDiscovery, MONTH_SLUGS, type MonthSlug } from "@/lib/weather-month-suggestions";

const SLUG_TO_WEATHER: Record<MonthSlug, string> = {
  november: "November",
  december: "December",
  january: "January",
  february: "February",
  march: "March",
  april: "April",
};

const SLUG_TO_EVENT_MONTH: Record<MonthSlug, "Nov" | "Dec" | "Jan" | "Feb" | "Mar" | "Apr"> = {
  november: "Nov",
  december: "Dec",
  january: "Jan",
  february: "Feb",
  march: "Mar",
  april: "Apr",
};

function midC(minC: number, maxC: number): number {
  return Math.round((minC + maxC) / 2);
}

export function generateStaticParams() {
  return MONTH_SLUGS.map((slug) => ({ month: slug }));
}

type Props = {
  params: Promise<{ month: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month } = await params;
  const slug = month.toLowerCase() as MonthSlug;
  const tWeatherMonth = await getTranslations("weather.month");

  if (!MONTH_SLUGS.includes(slug)) notFound();

  const monthName = SLUG_TO_WEATHER[slug];
  const row = weatherByMonth.find((r) => r.month === monthName);
  if (!row) notFound();

  const coastRange = `${row.coastMinC}–${row.coastMaxC}°C`;
  const troodosRange = `${row.troodosMinC}–${row.troodosMaxC}°C`;
  const ogImage = `${SITE_URL}/images/cyprus/cyprus-ancient-kourion.jpg`;
  const alternates = buildStrategyAAlternates(`/weather/${slug}`);

  return {
    title: `Cyprus Winter Weather ${monthName} | Coast & Troodos`,
    description: `Cyprus winter weather ${monthName}: coast ${coastRange}, Troodos ${troodosRange}. ${row.coastDesc} Plan trails, wineries, and winter events.`,
    alternates,
    openGraph: {
      images: [{ url: ogImage, width: 1200, height: 630, alt: tWeatherMonth("meta.ogImageAlt", { month: monthName }) }],
    },
  };
}

export default async function WeatherMonthPage({ params }: Props) {
  const { month } = await params;
  const slug = month.toLowerCase() as MonthSlug;

  if (!MONTH_SLUGS.includes(slug)) notFound();
  const [tNav, tWeatherPage, tWeatherMonth, tCommon, tHome] = await Promise.all([
    getTranslations("nav"),
    getTranslations("weather.page"),
    getTranslations("weather.month"),
    getTranslations("common"),
    getTranslations("home"),
  ]);

  const monthName = SLUG_TO_WEATHER[slug];
  const row = weatherByMonth.find((r) => r.month === monthName);
  const eventMonth = SLUG_TO_EVENT_MONTH[slug];
  const events = winterEvents.filter((e) => e.month === eventMonth);

  if (!row) notFound();

  const clampedDescClass = "text-olive/80 text-sm line-clamp-2 leading-relaxed";
  const currentMonthChipClass = "border-terracotta/50 bg-terracotta/5";
  const otherMonthChipClass = "border-sand-200/80 hover:border-terracotta/30";

  const coastMid = midC(row.coastMinC, row.coastMaxC);
  const troodosMid = midC(row.troodosMinC, row.troodosMaxC);

  const monthJumpLabel = tWeatherMonth("monthJump.aria");

  const monthDiscovery = getWeatherMonthDiscovery(slug).map((it) => ({
    href: it.href,
    label:
      it.key === "trails"
        ? tNav("trails")
        : it.key === "wineries"
          ? tNav("wineries")
          : it.key === "villages"
            ? tNav("villages")
            : it.key === "monasteries"
              ? tWeatherMonth("gateway.monasteries")
              : tNav("secrets"),
  }));

  return (
    <div className={`min-h-screen bg-sand ${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/weather"
        backLabel={tNav("weather")}
        title={tWeatherMonth("pageHeaderTitle", { month: monthName })}
        description={tWeatherMonth("pageHeaderDescription", {
          coastMin: row.coastMinC,
          coastMax: row.coastMaxC,
          troodosMin: row.troodosMinC,
          troodosMax: row.troodosMaxC,
          coastDesc: row.coastDesc,
        })}
        breadcrumbItems={[
          { label: tNav("home"), href: "/" },
          { label: tNav("weather"), href: "/weather" },
          { label: monthName, href: `/weather/${slug}`, isCurrent: true },
        ]}
      />

      {/* Month hero guidance */}
      <section className={SECTION.blockTop}>
        <div className={`${CARD.base} ${CARD.contentLg} bg-sand-100/50`}>
          <p className={`${TYPE.kicker} text-sage`}>{tWeatherMonth("hero.kicker")}</p>
          <h2 className={`${TYPE.sectionTitle} mt-2`}>
            {tWeatherMonth("hero.heading", { month: monthName })}
          </h2>
          <p className="text-olive/80 mt-3 max-w-2xl prose-body break-words leading-relaxed">
            {tWeatherMonth("hero.body", {
              coastMid,
              troodosMid,
            })}
          </p>
        </div>
      </section>

      {/* Jump to month */}
      <section className={SECTION.blockTop} aria-label={monthJumpLabel}>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 sm:-mx-0 sm:px-0 sm:overflow-visible scroll-smooth scroll-touch [-webkit-overflow-scrolling:touch] overscroll-x-contain">
          {MONTH_SLUGS.map((m) => {
            const name = SLUG_TO_WEATHER[m];
            const monthRow = weatherByMonth.find((r) => r.month === name);
            if (!monthRow) return null;
            const isCurrent = m === slug;
            return (
              <AppLink
                key={m}
                href={`/weather/${m}`}
                aria-current={isCurrent ? "page" : undefined}
                  className={`${CARD.compact} shrink-0 px-4 py-3 rounded-xl border transition-colors ${
                    isCurrent ? currentMonthChipClass : otherMonthChipClass
                  }`}
              >
                <div className="flex flex-col">
                  <span className={`${TYPE.cardTitleCompact} ${isCurrent ? "text-terracotta" : "text-olive"}`}>{name}</span>
                  <span className={`mt-1 text-xs ${isCurrent ? "text-terracotta/80" : "text-olive/70"}`}>
                    {tWeatherPage("table.coast")} {monthRow.coastMinC}–{monthRow.coastMaxC}° · {tWeatherPage("table.troodos")} {monthRow.troodosMinC}–{monthRow.troodosMaxC}°
                  </span>
                </div>
              </AppLink>
            );
          })}
        </div>
      </section>

      <div className={SECTION.blockGap}>
        <section aria-labelledby="conditions">
          <h2 id="conditions" className={`${TYPE.subSectionTitle} text-olive ${SECTION.headingGap}`}>
            {tWeatherMonth("conditionsHeading")}
          </h2>
          <div className={`${CARD.base} ${CARD.contentLg} bg-sand-100/50 space-y-4`}>
            <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-medium text-olive mb-1">
                {tWeatherMonth("conditionsCoastTitle")}
              </h3>
              <p className={clampedDescClass}>{row.coastDesc}</p>
              <p className="text-olive font-medium mt-1">
                {row.coastMinC}–{row.coastMaxC}°C
              </p>
            </div>
            <div>
              <h3 className="font-medium text-olive mb-1">
                {tWeatherMonth("conditionsTroodosTitle")}
              </h3>
              <p className={clampedDescClass}>{row.troodosDesc}</p>
              <p className="text-olive font-medium mt-1">
                {row.troodosMinC}–{row.troodosMaxC}°C
              </p>
            </div>
            </div>
          </div>
        </section>

        {/* Month-specific discovery links */}
        <section aria-labelledby="month-discovery">
          <h2 id="month-discovery" className={`${TYPE.subSectionTitle} text-olive ${SECTION.headingGap}`}>
            {tWeatherMonth("monthDiscovery.heading", { month: monthName })}
          </h2>
          <div className="flex flex-wrap gap-3">
            {monthDiscovery.map((d) => (
              <AppLink key={d.href} href={d.href} className={`${PILL.base} ${PILL.neutral}`}>
                {d.label}
              </AppLink>
            ))}
          </div>
        </section>

        {events.length > 0 && (
          <section aria-labelledby="events">
            <h2 id="events" className={`${TYPE.subSectionTitle} text-olive ${SECTION.headingGap}`}>
              {tWeatherMonth("eventsHeading", { month: monthName })}
            </h2>
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.id} className={`${CARD.base} ${CARD.content}`}>
                  <AppLink
                    href={`/events#${e.id}`}
                    className="block group"
                  >
                    <h3 className="font-medium text-olive group-hover:text-terracotta transition-colors">{e.name}</h3>
                    <p className="text-sm text-olive/80 mt-1 line-clamp-2">{e.description}</p>
                    {e.dates && (
                      <p className="text-xs text-olive/70 mt-2">{e.dates}</p>
                    )}
                  </AppLink>
                  <AppLink
                    href={`/plan?add=${encodeURIComponent(e.id)}`}
                    className="mt-2 inline-flex items-center min-h-[44px] py-2 text-sm font-medium text-terracotta hover:text-terracotta-muted hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded"
                  >
                    {tCommon("addToPlan")}
                  </AppLink>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-2">
          <RightNowNearYou title={tHome("rightNowNearYou")} />
        </div>

        <WeatherPushOptIn />

        <div className="flex flex-wrap gap-4">
          <AppLink href="/trails" className={`px-5 py-2.5 rounded-lg ${CTA.primaryCompact}`}>
            {tWeatherMonth("cta.trailConditions")}
          </AppLink>
          <AppLink href="/discover?filter=winery" className={`px-5 py-2.5 rounded-lg ${CTA.secondaryCompact}`}>
            {tWeatherMonth("cta.winterWineries")}
          </AppLink>
          <AppLink href="/plan" className={`px-5 py-2.5 rounded-lg ${CTA.chipTertiary}`}>
            {tCommon("planYourTrip")}
          </AppLink>
        </div>
      </div>

      <WeatherMonthFooter />
    </div>
  );
}
