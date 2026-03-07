import type { Metadata } from "next";
import { airports } from "@/data/airport";
import { SITE_URL } from "@/lib/site-url";
import { winterTipsPractical } from "@/data/winter-tips";
import { LAYOUT, CARD, CTA } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import BeforeYouGoChecklist from "@/components/BeforeYouGoChecklist";
import Link from "next/link";

const ogImage = `${SITE_URL}/images/cyprus/cyprus-ancient-kourion.jpg`;

export const metadata: Metadata = {
  title: "Just Landed? | Cyprus Winter Airport Guide",
  description:
    "Larnaca & Paphos arrivals: taxis, buses, car hire. Coast mild, Troodos cooler. Essential numbers and tips. Just landed? Start here. Free Cyprus Winter guide.",
  alternates: { canonical: `${SITE_URL}/airport` },
  openGraph: {
    title: "Just Landed? | Cyprus Winter Airport Guide",
    description: "Larnaca & Paphos arrivals: taxis, buses, car hire. Coast mild, Troodos cooler. Essential numbers.",
    url: `${SITE_URL}/airport`,
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "Cyprus winter — Larnaca and Paphos airport guide" }],
  },
};

const CITY_GREEK: Record<string, string> = {
  Larnaca: "Λάρνακα",
  Paphos: "Πάφος",
};

export default function AirportPage() {
  return (
    <div className={`${LAYOUT.listNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/"
        backLabel="Home"
        title="Just landed?"
        description="Transport from Larnaca and Paphos. Taxis, buses, car hire."
        descriptionSecondary="Coast mild, Troodos cooler—pack layers."
      />

      {/* Essentials strip — scannable, high visibility for jetlagged users */}
      <section
        aria-labelledby="essentials-heading"
        className={`mb-10 rounded-xl bg-aegean/10 border border-aegean/30 ${CARD.content}`}
      >
        <h2 id="essentials-heading" className="sr-only">
          Essential numbers
        </h2>
        <p className="text-aegean font-semibold text-sm">
          Emergency <strong>112</strong> · Tourist info <strong>1460</strong> · Ambulance <strong>199</strong>
        </p>
        <p className="text-olive/70 text-xs mt-1">Save these. Hope you never need them.</p>
      </section>

      {/* Quick pick — jump to your airport */}
      <nav
        aria-label="Choose your airport"
        className="mb-10 flex gap-3"
      >
        {airports.map((airport) => (
          <a
            key={airport.code}
            href={`#airport-${airport.code}`}
            className={`min-w-[44px] justify-center px-5 py-2.5 rounded-lg ${CTA.secondaryCompact}`}
          >
            {airport.code}
          </a>
        ))}
      </nav>

      <div className="space-y-10">
        {airports.map((airport) => (
          <section
            key={airport.code}
            id={`airport-${airport.code}`}
            aria-labelledby={`airport-${airport.code}-heading`}
            className={`rounded-xl overflow-hidden ${CARD.base} scroll-mt-24`}
          >
            <div className="bg-terracotta text-white px-6 py-4">
              <h2
                id={`airport-${airport.code}-heading`}
                className="font-display text-xl font-semibold text-white"
              >
                {airport.code} — {airport.name}
              </h2>
              <p className="text-white/90 text-sm break-words mt-0.5">
                {airport.city}
                {CITY_GREEK[airport.city] && (
                  <span className="ml-1.5 text-white/80">({CITY_GREEK[airport.city]})</span>
                )}
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-display font-semibold text-olive mb-3">Transport</h3>
                <ul className="space-y-3" role="list">
                  {airport.transport.map((t) => (
                    <li
                      key={t.type}
                      className="flex flex-col sm:flex-row sm:items-start gap-2 p-4 rounded-lg bg-sand/50 border border-sand-200/80"
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
                <h3 className="font-display font-semibold text-olive mb-3">Things to know</h3>
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

      {/* Essential info — tickable checklist, persisted in localStorage */}
      <section className={`mt-10 ${CARD.base} ${CARD.content} bg-sand/80`}>
        <BeforeYouGoChecklist tips={winterTipsPractical} />
      </section>

      <p className="mt-10 text-center text-olive/80 text-sm max-w-md mx-auto leading-relaxed break-words">
        Drop your bags, find a harbour café. Order a coffee. Watch the light. Tonight, just
        arrive. The island isn&apos;t going anywhere.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-4">
        <Link href="/plan?template=short-stay" className={CTA.primaryCompact}>
          48-hour itinerary
        </Link>
        <Link href="/discover" className={CTA.secondaryCompact}>
          Start exploring
        </Link>
        <Link href="/plan" className={CTA.secondaryCompact}>
          Plan your trip
        </Link>
        <Link
          href="/weather"
          className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-lg border border-sand-300 text-olive font-medium hover:border-terracotta/50 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Check weather
        </Link>
      </div>
    </div>
  );
}
