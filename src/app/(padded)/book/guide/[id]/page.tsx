import type { Metadata } from "next";
import { guides } from "@/data/guides";
import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import { SITE_URL } from "@/lib/site-url";
import BackLink from "@/components/BackLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import { notFound } from "next/navigation";
import GuideBookingForm from "./GuideBookingForm";
import { getTranslations } from "next-intl/server";

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
  const [tNav, tCommon, tBookPages] = await Promise.all([
    getTranslations("nav"),
    getTranslations("common"),
    getTranslations("book.pages"),
  ]);

  return (
    <div className={`min-h-screen bg-sand ${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <nav className={`flex flex-col gap-1 ${SECTION.headingGap}`} aria-label={tBookPages("pageNavAria")}>
        <BackLink href="/book/guide" label={tCommon("backTo", { label: tCommon("breadcrumbs.bookGuide") })} />
        <Breadcrumbs
          items={[
            { label: tNav("home"), href: "/" },
            { label: tNav("trails"), href: "/trails" },
            { label: tCommon("breadcrumbs.bookGuide"), href: "/book/guide" },
            { label: guide.name, href: `/book/guide/${id}`, isCurrent: true },
          ]}
          className="py-1 px-0 text-xs text-olive/60"
        />
      </nav>

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-aegean/20 text-aegean">
            {tBookPages("guideDetail.badge")}
          </span>
          {guide.isVerified && (
            <span
              className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-aegean/20 text-aegean"
              title={tBookPages("guideDetail.verifiedTitle")}
            >
              {tBookPages("guideDetail.verifiedLabel")}
            </span>
          )}
        </div>
        <h1 className={`${TYPE.pageTitle} mt-3`}>{tBookPages("guideDetail.title")}</h1>
        <p className="text-olive/80 mt-1 break-words">
          {guide.name} · {guide.region}
        </p>
        <p className="text-sm text-olive/70 mt-3 max-w-lg break-words prose-body">{guide.description}</p>
      </div>

      <GuideBookingForm guide={guide} preselectedTrailId={trail ?? undefined} />

      {(guide.bookingUrl || guide.contactPhone) && (
        <section className={`${SECTION.blockTop} space-y-4`} aria-label={tBookPages("otherWaysAria")}>
          {guide.bookingUrl && (
            <p className="text-sm text-olive/80">
              {tBookPages("guideDetail.other.or")}{" "}
              <a
                href={guide.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center min-h-[44px] py-2 px-3 rounded-md text-terracotta font-medium hover:underline hover:bg-terracotta/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
                aria-label={tBookPages("guideDetail.other.bookDirectAria")}
              >
                {tBookPages("guideDetail.other.bookDirectCta")}
              </a>
            </p>
          )}
          {guide.contactPhone && (
            <p className="text-sm text-olive/70">
              {tBookPages("guideDetail.other.callPrefix")}{" "}
              <a
                href={`tel:${guide.contactPhone}`}
                className="inline-flex items-center min-h-[44px] py-2 px-3 rounded-md text-terracotta hover:underline font-medium hover:bg-terracotta/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2"
              >
                {guide.contactPhone}
              </a>{" "}
              {tBookPages("guideDetail.other.callSuffix")}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
