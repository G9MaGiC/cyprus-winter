import type { Metadata } from "next";
import AppLink from "@/components/AppLink";
import { LAYOUT, SECTION } from "@/lib/design-tokens";
import WeatherPushOptIn from "@/components/WeatherPushOptIn";
import { SITE_URL } from "@/lib/site-url";
import PageHeader from "@/components/PageHeader";
import { weatherByMonth } from "@/data/weather";
import { getTranslations } from "next-intl/server";

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

export default async function WeatherPage() {
  const [tNav, tWeather] = await Promise.all([
    getTranslations("nav"),
    getTranslations("weather.page"),
  ]);
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/"
        backLabel={tNav("home")}
        title={tWeather("title")}
        description={tWeather("description")}
        breadcrumbItems={[{ label: tNav("home"), href: "/" }, { label: tNav("weather"), href: "/weather", isCurrent: true }]}
      />

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
                    <p className="text-olive/80 text-xs mt-0.5 line-clamp-2">{row.coastDesc}</p>
                  </div>
                  <div>
                    <p className="text-olive/60 text-xs">
                      {tWeather("table.troodos")}
                    </p>
                    <p className="text-olive font-medium">{row.troodosMinC}–{row.troodosMaxC}°C</p>
                    <p className="text-olive/80 text-xs mt-0.5 line-clamp-2">{row.troodosDesc}</p>
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
                  {row.coastDesc}
                </td>
                <td className="py-4 px-4 text-olive/90">
                  {row.troodosMinC}–{row.troodosMaxC}°C
                </td>
                <td className="py-4 px-4 text-sm text-olive/80 max-w-xs">
                  {row.troodosDesc}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <WeatherPushOptIn />

      <div className="mt-12 space-y-4 text-olive/80 text-sm max-w-2xl">
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
