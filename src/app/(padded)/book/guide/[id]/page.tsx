import type { Metadata } from "next";
import { guides } from "@/data/guides";
import { LAYOUT } from "@/lib/design-tokens";
import { SITE_URL } from "@/lib/site-url";
import BackLink from "@/components/BackLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import { notFound } from "next/navigation";
import GuideBookingForm from "./GuideBookingForm";

export function generateStaticParams() {
  return guides.map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const guide = guides.find((g) => g.id === id);
  if (!guide) return { title: "Not found" };
  return {
    title: `Book a guided hike | ${guide.name} | Cyprus Winter`,
    description: `Request a guided winter hike with ${guide.name} in ${guide.region}. Small groups, local expertise. They'll confirm by email.`,
    alternates: { canonical: `${SITE_URL}/book/guide/${id}` },
  };
}

export default async function GuideBookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ trail?: string }>;
}) {
  const { id } = await params;
  const { trail } = await searchParams;
  const guide = guides.find((g) => g.id === id);
  if (!guide) notFound();

  return (
    <div className={`min-h-screen bg-sand ${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <nav className="flex flex-col gap-1 mb-6" aria-label="Page navigation">
        <BackLink href="/book/guide" label="Back to guides" />
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Trails", href: "/trails" },
            { label: "Book a guide", href: "/book/guide" },
            { label: guide.name, href: `/book/guide/${id}`, isCurrent: true },
          ]}
          className="py-1 px-0 text-xs text-olive/60"
        />
      </nav>

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-aegean/20 text-aegean">
            Guided hike
          </span>
          {guide.isVerified && (
            <span
              className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-aegean/20 text-aegean"
              title="Verified partner: receives booking requests directly"
            >
              Verified partner
            </span>
          )}
        </div>
        <h1 className="font-display text-3xl font-bold text-olive mt-3">Book a guided hike</h1>
        <p className="text-olive/80 mt-1 break-words">
          {guide.name} · {guide.region}
        </p>
        <p className="text-sm text-olive/70 mt-3 max-w-lg break-words prose-body">{guide.description}</p>
      </div>

      <GuideBookingForm guide={guide} preselectedTrailId={trail ?? undefined} />

      {(guide.bookingUrl || guide.contactPhone) && (
        <section className="mt-8 space-y-4" aria-label="Other ways to book">
          {guide.bookingUrl && (
            <p className="text-sm text-olive/80">
              Or{" "}
              <a
                href={guide.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center min-h-[44px] py-2 px-3 rounded-md text-terracotta font-medium hover:underline hover:bg-terracotta/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
                aria-label="Book on the guide's website (opens in new tab)"
              >
                book directly on their site
              </a>
            </p>
          )}
          {guide.contactPhone && (
            <p className="text-sm text-olive/70">
              Or call{" "}
              <a
                href={`tel:${guide.contactPhone}`}
                className="inline-flex items-center min-h-[44px] py-2 px-3 rounded-md text-terracotta hover:underline font-medium hover:bg-terracotta/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
              >
                {guide.contactPhone}
              </a>{" "}
              to check availability.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
