import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { CARD, LAYOUT, PILL, SECTION, TYPE } from "@/lib/design-tokens";
import WeatherPushOptIn from "@/components/WeatherPushOptIn";
import RightNowNearYou from "@/app/_home/RightNowNearYou";
import { SITE_URL } from "@/lib/site-url";
import PageHeader from "@/components/PageHeader";
import { weatherByMonth } from "@/data/weather";
import { getLocale, getTranslations } from "next-intl/server";

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

export const metadata: Metadata = {
  title: "Cyprus Winter Weather by Month | Coast & Troodos",
  description:
    "Cyprus winter weather by month: coast 18–20°C, Troodos 8–12°C. Pack layers, plan trails and wineries. November to April. Sixteen degrees when home is six.",
  alternates: { canonical: `${SITE_URL}/weather` },
  openGraph: {
    title: "Cyprus Winter Weather by Month | Coast & Troodos",
    description: "Cyprus winter weather by month: coast 18–20°C, Troodos 8–12°C. Pack layers, plan trails and wineries.",
    url: `${SITE_URL}/weather`,
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Cyprus winter weather guide" }],
  },
};

function shortSentence(desc: string): string {
  const first = desc.split(".")[0]?.trim() ?? "";
  if (!first) return desc;
  return first.endsWith("!") || first.endsWith("?") ? first : `${first}.`;
}

export default async function WeatherPage() {
  const [locale, tNav, tWeather, tHome] = await Promise.all([
    getLocale(),
    getTranslations("nav"),
    getTranslations("weather.page"),
    getTranslations("home"),
  ]);

  const monthSelectorSectionClassName = `${SECTION.blockTop} hidden md:block`;
  const mobileClampClass = "text-olive/80 text-xs mt-0.5 line-clamp-1";

  // #region agent log H1 translation labels + H3 responsive class
  fetch("http://127.0.0.1:7628/ingest/80b5b3b1-6619-475c-a7bb-fb3080a9d865", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ce8533" },
    body: JSON.stringify({
      sessionId: "ce8533",
      runId: "debug_weather_ux_anomaly_1",
      hypothesisId: "H1_translation_namespace_or_fallback",
      location: "src/app/(padded)/weather/page.tsx",
      message: "Weather hub: resolved translation strings for coast/troodos labels",
      data: {
        locale,
        coastLabel: tWeather("table.coast"),
        troodosLabel: tWeather("table.troodos"),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  // #region agent log H3 responsive month selector rail
  fetch("http://127.0.0.1:7628/ingest/80b5b3b1-6619-475c-a7bb-fb3080a9d865", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ce8533" },
    body: JSON.stringify({
      sessionId: "ce8533",
      runId: "debug_weather_ux_anomaly_1",
      hypothesisId: "H3_month_selector_visibility_on_mobile",
      location: "src/app/(padded)/weather/page.tsx",
      message: "Weather hub: month selector rail wrapper className",
      data: {
        locale,
        monthSelectorSectionClassName,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  // #region agent log H4 line-clamp class presence
  fetch("http://127.0.0.1:7628/ingest/80b5b3b1-6619-475c-a7bb-fb3080a9d865", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ce8533" },
    body: JSON.stringify({
      sessionId: "ce8533",
      runId: "debug_weather_ux_anomaly_1",
      hypothesisId: "H4_description_clamp_not_applied",
      location: "src/app/(padded)/weather/page.tsx",
      message: "Weather hub: mobile description clamp class expectation",
      data: {
        locale,
        mobileClampClass,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

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
          <p className="text-olive/80 mt-3 max-w-2xl prose-body break-words leading-relaxed">{tWeather("hero.body")}</p>
        </div>
      </section>

      {/* Month selector (hybrid UI) */}
      <section className={monthSelectorSectionClassName} aria-label={tWeather("monthSelector.aria")}>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 sm:-mx-0 sm:px-0 sm:overflow-visible">
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
                  <span className="font-display text-sm font-semibold text-olive">{row.month}</span>
                  <span className="mt-1 text-xs text-olive/70">
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
                  <span className="font-display font-semibold text-olive">{row.month}</span>
                  {slug && (
                    <span className="text-xs font-medium text-terracotta">
                      {tWeather("mobile.details")}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-olive/60 text-xs">
                      {tWeather("table.coast")}
                    </p>
                    <p className="text-olive font-medium">{row.coastMinC}–{row.coastMaxC}°C</p>
                    <p className={mobileClampClass}>{shortSentence(row.coastDesc)}</p>
                  </div>
                  <div>
                    <p className="text-olive/60 text-xs">
                      {tWeather("table.troodos")}
                    </p>
                    <p className="text-olive font-medium">{row.troodosMinC}–{row.troodosMaxC}°C</p>
                    <p className={mobileClampClass}>{shortSentence(row.troodosDesc)}</p>
                  </div>
                </div>
              </div>
          );
          return slug ? (
            <AppLink key={row.month} href={`/weather/${slug}`} className="block">
              {content}
            </AppLink>
          ) : (
            <div key={row.month}>{content}</div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-sand-200/80">
              <th className="py-3 px-4 font-display font-semibold text-olive">
                {tWeather("table.month")}
              </th>
              <th
                className="py-3 px-4 font-display font-semibold text-olive"
                scope="col"
              >
                {tWeather("table.coast")}
              </th>
              <th
                className="py-3 px-4 font-display font-semibold text-olive"
                scope="col"
              >
                {tWeather("table.coastConditions")}
              </th>
              <th
                className="py-3 px-4 font-display font-semibold text-olive"
                scope="col"
              >
                {tWeather("table.troodos")}
              </th>
              <th
                className="py-3 px-4 font-display font-semibold text-olive"
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
                <td className="py-4 px-4 text-sm text-olive/80 max-w-xs">
                  {shortSentence(row.coastDesc)}
                </td>
                <td className="py-4 px-4 text-olive/90">
                  {row.troodosMinC}–{row.troodosMaxC}°C
                </td>
                <td className="py-4 px-4 text-sm text-olive/80 max-w-xs">
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

      <div className={`${SECTION.blockTop} space-y-4 text-olive/80 text-sm max-w-2xl`}>
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
    </div>
  );
}
