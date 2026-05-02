import type { Metadata } from "next";
import Link from "next/link";
import { routing } from "@/i18n/routing";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { weatherHubPageMeta } from "@/lib/locale-page-meta";
import { LAYOUT, SECTION } from "@/lib/design-tokens";
import WeatherPushOptIn from "@/components/WeatherPushOptIn";
import PageHeader from "@/components/PageHeader";
import { weatherByMonth } from "@/data/weather";

const MONTH_TO_SLUG: Record<string, string> = {
  November: "november",
  December: "december",
  January: "january",
  February: "february",
  March: "march",
  April: "april",
};

export const metadata: Metadata = applyLocaleToMetadata(
  weatherHubPageMeta,
  "/weather",
  routing.defaultLocale
);

export default function WeatherPage() {
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/"
        backLabel="Home"
        title="Cyprus Winter Weather by Month"
        description="Coast and Troodos temperatures, month by month. Plan layers, trails, and wineries."
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Weather", href: "/weather", isCurrent: true }]}
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
                    <span className="text-xs font-medium text-terracotta">Details →</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-olive/60 text-xs">Coast</p>
                    <p className="text-olive font-medium">{row.coastMinC}–{row.coastMaxC}°C</p>
                    <p className="text-olive/80 text-xs mt-0.5 line-clamp-2">{row.coastDesc}</p>
                  </div>
                  <div>
                    <p className="text-olive/60 text-xs">Troodos</p>
                    <p className="text-olive font-medium">{row.troodosMinC}–{row.troodosMaxC}°C</p>
                    <p className="text-olive/80 text-xs mt-0.5 line-clamp-2">{row.troodosDesc}</p>
                  </div>
                </div>
              </div>
          );
          return slug ? (
            <Link key={row.month} href={`/weather/${slug}`} className="block">
              {content}
            </Link>
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
              <th className="py-3 px-4 font-display font-semibold text-olive">Month</th>
              <th className="py-3 px-4 font-display font-semibold text-olive" scope="col">Coast (°C)</th>
              <th className="py-3 px-4 font-display font-semibold text-olive" scope="col">Conditions</th>
              <th className="py-3 px-4 font-display font-semibold text-olive" scope="col">Troodos (°C)</th>
              <th className="py-3 px-4 font-display font-semibold text-olive" scope="col">Conditions</th>
            </tr>
          </thead>
          <tbody>
            {weatherByMonth.map((row) => {
              const slug = MONTH_TO_SLUG[row.month];
              return (
              <tr key={row.month} className="border-b border-sand-100">
                <td className="py-4 px-4">
                  {slug ? (
                    <Link
                      href={`/weather/${slug}`}
                      className="font-medium text-olive hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded min-h-[44px] inline-flex items-center"
                    >
                      {row.month}
                    </Link>
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
        <p>
          Coast means Larnaca, Limassol, Paphos — mild Mediterranean winters. Troodos is the mountains: villages like Platres and Omodos, and the ski resort on Olympus. Pack layers; the difference between coast and mountain can be 10°C or more.
        </p>
        <p>
          <Link
            href="/trails"
            className={SECTION.aegeanLink}
          >
            Check trail conditions
          </Link>{" "}
          before heading up.{" "}
          <Link
            href="/discover?filter=winery"
            className={SECTION.aegeanLink}
          >
            Winter wineries
          </Link>{" "}
          — fireside tastings, book ahead.
        </p>
      </div>
    </div>
  );
}
