import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LAYOUT, CARD, CTA, SECTION } from "@/lib/design-tokens";
import { SITE_URL } from "@/lib/site-url";
import PageHeader from "@/components/PageHeader";
import { weatherByMonth } from "@/data/weather";
import { winterEvents } from "@/data/events";

const MONTH_SLUGS = ["november", "december", "january", "february", "march", "april"] as const;
type MonthSlug = (typeof MONTH_SLUGS)[number];

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

export function generateStaticParams() {
  return MONTH_SLUGS.map((slug) => ({ month: slug }));
}

type Props = {
  params: Promise<{ month: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month } = await params;
  const slug = month.toLowerCase() as MonthSlug;
  if (!MONTH_SLUGS.includes(slug))
    return {
      title: "Weather not found | Cyprus Winter",
      description: "Cyprus winter weather by month: December, January, February, March. Coast and Troodos temperatures.",
    };

  const monthName = SLUG_TO_WEATHER[slug];
  const row = weatherByMonth.find((r) => r.month === monthName);
  if (!row)
    return {
      title: "Weather not found | Cyprus Winter",
      description: "Cyprus winter weather by month. Plan trails and wineries.",
    };

  const coastRange = `${row.coastMinC}–${row.coastMaxC}°C`;
  const troodosRange = `${row.troodosMinC}–${row.troodosMaxC}°C`;
  const ogImage = `${SITE_URL}/images/cyprus/cyprus-ancient-kourion.jpg`;

  return {
    title: `Cyprus Winter Weather ${monthName} | Coast & Troodos`,
    description: `Cyprus winter weather ${monthName}: coast ${coastRange}, Troodos ${troodosRange}. ${row.coastDesc} Plan trails, wineries, and winter events.`,
    alternates: { canonical: `${SITE_URL}/weather/${slug}` },
    openGraph: {
      images: [{ url: ogImage, width: 1200, height: 630, alt: `Cyprus winter coast—${monthName} weather` }],
    },
  };
}

export default async function WeatherMonthPage({ params }: Props) {
  const { month } = await params;
  const slug = month.toLowerCase() as MonthSlug;

  if (!MONTH_SLUGS.includes(slug)) notFound();

  const monthName = SLUG_TO_WEATHER[slug];
  const row = weatherByMonth.find((r) => r.month === monthName);
  const eventMonth = SLUG_TO_EVENT_MONTH[slug];
  const events = winterEvents.filter((e) => e.month === eventMonth);

  if (!row) notFound();

  return (
    <div className={`min-h-screen bg-sand ${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/weather"
        backLabel="Weather"
        title={`Cyprus Winter Weather: ${monthName}`}
        description={`Coast ${row.coastMinC}–${row.coastMaxC}°C, Troodos ${row.troodosMinC}–${row.troodosMaxC}°C. ${row.coastDesc}`}
      />

      <div className="space-y-10 sm:space-y-14">
        <section aria-labelledby="conditions">
          <h2 id="conditions" className="font-display text-xl font-semibold text-olive mb-4">
            What to expect
          </h2>
          <div className={`${CARD.base} ${CARD.contentLg} bg-sand-100/50 space-y-4`}>
            <div>
              <h3 className="font-medium text-olive mb-1">Coast (Larnaca, Limassol, Paphos)</h3>
              <p className="text-olive/80 text-sm">{row.coastDesc}</p>
              <p className="text-olive font-medium mt-1">
                {row.coastMinC}–{row.coastMaxC}°C
              </p>
            </div>
            <div>
              <h3 className="font-medium text-olive mb-1">Troodos (mountains, villages)</h3>
              <p className="text-olive/80 text-sm">{row.troodosDesc}</p>
              <p className="text-olive font-medium mt-1">
                {row.troodosMinC}–{row.troodosMaxC}°C
              </p>
            </div>
          </div>
        </section>

        {events.length > 0 && (
          <section aria-labelledby="events">
            <h2 id="events" className="font-display text-xl font-semibold text-olive mb-4">
              Winter events in {monthName}
            </h2>
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.id} className={`${CARD.base} ${CARD.content}`}>
                  <Link
                    href={`/events#${e.id}`}
                    className="block group"
                  >
                    <h3 className="font-medium text-olive group-hover:text-terracotta transition-colors">{e.name}</h3>
                    <p className="text-sm text-olive/80 mt-1 line-clamp-2">{e.description}</p>
                    {e.dates && (
                      <p className="text-xs text-olive/70 mt-2">{e.dates}</p>
                    )}
                  </Link>
                  <Link
                    href={`/plan?add=${encodeURIComponent(e.id)}`}
                    className="mt-2 inline-flex text-sm font-medium text-terracotta hover:text-terracotta-muted hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 rounded"
                  >
                    Add to plan
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-wrap gap-4">
          <Link href="/trails" className={`px-5 py-2.5 rounded-lg ${CTA.primaryCompact}`}>
            Trail conditions
          </Link>
          <Link href="/discover?filter=winery" className={`px-5 py-2.5 rounded-lg ${CTA.secondaryCompact}`}>
            Winter wineries
          </Link>
          <Link href="/plan" className={`px-5 py-2.5 rounded-lg ${CTA.chipTertiary}`}>
            Plan your trip
          </Link>
        </div>
      </div>

      <p className="mt-12 text-olive/70 text-sm">
        <Link href="/weather" className={SECTION.aegeanLink}>
          All months
        </Link>
        {" · "}
        <Link href="/regions/troodos" className={SECTION.aegeanLink}>
          Troodos winter
        </Link>
        {" · "}
        <Link href="/plan" className={SECTION.aegeanLink}>
          Plan your trip
        </Link>
      </p>
    </div>
  );
}
