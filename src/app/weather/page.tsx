import type { Metadata } from "next";
import Link from "next/link";
import { LAYOUT } from "@/lib/design-tokens";
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

export const metadata: Metadata = {
  title: "Cyprus Winter Weather by Month | Coast & Troodos",
  description:
    "Cyprus winter weather: coast 18–20°C, Troodos 8–12°C in December. What to pack. November to April by month. Plan trails and wineries.",
};

export default function WeatherPage() {
  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/"
        title="Cyprus Winter Weather by Month"
        description="Coast and Troodos temperatures, month by month. Plan layers, trails, and wineries."
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-sand-200">
              <th className="py-3 px-4 font-display font-semibold text-olive">Month</th>
              <th className="py-3 px-4 font-display font-semibold text-olive">Coast (°C)</th>
              <th className="py-3 px-4 font-display font-semibold text-olive">Coast</th>
              <th className="py-3 px-4 font-display font-semibold text-olive">Troodos (°C)</th>
              <th className="py-3 px-4 font-display font-semibold text-olive">Troodos</th>
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

      <div className="mt-12 space-y-4 text-olive/80 text-sm max-w-2xl">
        <p>
          Coast means Larnaca, Limassol, Paphos — mild Mediterranean winters. Troodos is the mountains: villages like Platres and Omodos, and the ski resort on Olympus. Pack layers; the difference between coast and mountain can be 10°C or more.
        </p>
        <p>
          <Link
            href="/trails"
            className="text-aegean hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 rounded"
          >
            Check trail conditions
          </Link>{" "}
          before heading up.{" "}
          <Link
            href="/discover?filter=winery"
            className="text-aegean hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 focus-visible:ring-offset-2 rounded"
          >
            Winter wineries
          </Link>{" "}
          — fireside tastings, book ahead.
        </p>
      </div>
    </div>
  );
}
