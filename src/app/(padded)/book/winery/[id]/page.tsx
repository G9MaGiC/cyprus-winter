import type { Metadata } from "next";
import { wineries } from "@/data/wineries";
import { LAYOUT } from "@/lib/design-tokens";
import { SITE_URL } from "@/lib/site-url";
import BackLink from "@/components/BackLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import { notFound } from "next/navigation";
import WineryBookingForm from "./WineryBookingForm";

export function generateStaticParams() {
  return wineries.map((w) => ({ id: w.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const winery = wineries.find((w) => w.id === id);
  if (!winery) return { title: "Not found" };
  return {
    title: `Book a tasting | ${winery.name} | Cyprus Winter`,
    description: `Book a winter tasting at ${winery.name} in ${winery.region}. Cosy fires, heaters, often the owner pouring. Confirmation by email. Book ahead. Cyprus Winter.`,
    alternates: { canonical: `${SITE_URL}/book/winery/${id}` },
  };
}

export default async function WineryBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const winery = wineries.find((w) => w.id === id);
  if (!winery) notFound();

  const canonicalUrl = `${SITE_URL}/book/winery/${id}`;

  return (
    <div className={`min-h-screen bg-sand ${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <nav className="flex flex-col gap-1 mb-6" aria-label="Page navigation">
        <BackLink href={`/discover/${id}`} label={`Back to ${winery.name}`} />
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Discover", href: "/discover" },
            { label: winery.name, href: `/discover/${id}` },
            { label: "Book tasting", href: canonicalUrl, isCurrent: true },
          ]}
          className="py-1 px-0 text-xs text-olive/60"
        />
      </nav>

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-terracotta/20 text-terracotta">
            Wine tasting
          </span>
          {winery.isVerified && (
            <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-aegean/20 text-aegean" title="Verified partner: receives booking requests directly">
              Verified partner
            </span>
          )}
        </div>
        <h1 className="font-display text-3xl font-bold text-olive mt-3">
          Book a tasting
        </h1>
        <p className="text-olive/80 mt-1 break-words">{winery.name} · {winery.region}</p>
        {winery.tastingInfo && (
          <p className="text-sm text-olive/70 mt-2 break-words prose-body">{winery.tastingInfo}</p>
        )}
        <p className="text-sm text-olive/70 mt-3 max-w-lg break-words prose-body">
          Winter tastings here are cosy — fire, heaters, and often the owner pouring. Send your request and they&apos;ll confirm by email.
        </p>
        <p className="text-xs text-olive/60 mt-2 break-words">
          For adults of legal drinking age. Drink responsibly.
        </p>
      </div>

      <WineryBookingForm wineryId={winery.id} wineryName={winery.name} />

      {(winery.bookingUrl || winery.contactPhone) && (
        <section className="mt-8 space-y-4" aria-label="Other ways to book">
          {winery.bookingUrl && (
            <p className="text-sm text-olive/80">
              Or{" "}
              <a
                href={winery.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center min-h-[44px] py-2 px-3 rounded-md text-terracotta font-medium hover:underline hover:bg-terracotta/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
                aria-label="Book on the winery website (opens in new tab)"
              >
                book on the winery website
              </a>
              {" "}— they often have more availability.
            </p>
          )}
          {winery.contactPhone && (
            <p className="text-sm text-olive/70">
              Or call{" "}
              <a href={`tel:${winery.contactPhone}`} className="inline-flex items-center min-h-[44px] py-2 px-3 rounded-md text-terracotta hover:underline font-medium hover:bg-terracotta/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2">
                {winery.contactPhone}
              </a>
              {" "}to reserve or check availability — they&apos;re usually happy to help.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
