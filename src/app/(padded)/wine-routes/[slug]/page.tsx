import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { wineries } from "@/data/wineries";
import { WINE_ROUTES } from "@/data/wine-routes";
import { LAYOUT, SECTION } from "@/lib/design-tokens";
import { wineRouteSlugMetadata } from "@/lib/locale-metadata-dynamic";
import { routing } from "@/i18n/routing";
import AttractionCard from "@/components/AttractionCard";
import PageHeader from "@/components/PageHeader";

export function generateStaticParams() {
  return WINE_ROUTES.map((r) => ({ slug: r.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return wineRouteSlugMetadata(slug, routing.defaultLocale);
}

export default async function WineRoutePage({ params }: Props) {
  const { slug } = await params;
  const route = WINE_ROUTES.find((r) => r.slug === slug);
  if (!route) notFound();

  const routeWineries = wineries.filter((w) => w.wineRoute?.toLowerCase() === slug);

  return (
    <div className={`${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/wineries"
        backLabel="Wineries"
        title={`${route.title} Wine Route`}
        description={route.description}
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Wineries", href: "/wineries" },
          { label: `${route.title} Route`, href: `/wine-routes/${slug}`, isCurrent: true },
        ]}
      />

      <h2 id="wineries-list" className="sr-only">
        Wineries on this route
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {routeWineries.map((w) => (
          <AttractionCard key={w.id} a={w} />
        ))}
      </div>

      <div className={SECTION.footerBlock}>
        <p className="text-center text-olive/70 text-sm">
          <Link href="/wineries" className={SECTION.aegeanLink}>
            All Cyprus wineries
          </Link>
          {" · "}
          <Link href="/plan" className={SECTION.aegeanLink}>
            Plan your trip
          </Link>
        </p>
      </div>
    </div>
  );
}
