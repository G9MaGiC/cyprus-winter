import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  beaches,
  ancientSites,
  villages,
  monasteries,
} from "@/data/attractions";
import { wineries } from "@/data/wineries";
import { trails } from "@/data/trails";
import { winterEvents } from "@/data/events";
import { REGION_CONFIGS, filterByRegion, wineryMatchesRegion, type RegionSlug } from "@/data/regions";
import { LAYOUT, CARD, TYPE, SECTION } from "@/lib/design-tokens";
import { SITE_URL } from "@/lib/site-url";
import PageHeader from "@/components/PageHeader";
import { getTrailImage } from "@/lib/cyprus-images";
import { getAttractionImage } from "@/lib/cyprus-images";
import { DifficultyBadge } from "@/components/TrailBadges";
import type { Trail } from "@/data/trails";
import type { Attraction } from "@/data/attractions";
import type { Winery } from "@/data/wineries";

export function generateStaticParams() {
  return REGION_CONFIGS.map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = REGION_CONFIGS.find((c) => c.slug === slug);
  if (!config)
    return {
      title: "Region not found | Cyprus Winter",
      description: "Cyprus winter regions: Troodos, Paphos, Ayia Napa, Larnaca, Limassol. Explore trails, wineries, and villages.",
    };

  return {
    title: `${config.title} | Cyprus Winter`,
    description: config.description,
    alternates: { canonical: `${SITE_URL}/regions/${slug}` },
  };
}

function TrailCard({ trail }: { trail: Trail }) {
  const durationH = Math.round(trail.durationMin / 60);
  return (
    <Link
      href={`/trails/${trail.id}`}
      className={`block rounded-xl overflow-hidden group ${CARD.base} ${CARD.hover} ${CARD.link}`}
    >
      <div className="relative aspect-video overflow-hidden bg-olive/10">
        <Image
          src={getTrailImage(trail.id)}
          alt={`${trail.name}, ${trail.region}—${trail.lengthKm}km ${trail.difficulty} winter trail, Cyprus`}
          fill
          className="object-cover group-hover:scale-105 transition-transform"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
        <div className="absolute bottom-3 left-3">
          <DifficultyBadge difficulty={trail.difficulty} />
        </div>
      </div>
      <div className={CARD.content}>
        <h3 className={`${TYPE.cardTitle} truncate`} title={trail.name}>
          {trail.name}
        </h3>
        <p className="text-sm text-olive/70">
          {trail.lengthKm}km · ~{durationH}h
        </p>
      </div>
    </Link>
  );
}

function PlaceCard({
  item,
  type,
}: {
  item: Attraction | Winery;
  type: "village" | "monastery" | "winery" | "beach" | "ancient";
}) {
  return (
    <Link
      href={`/discover/${item.id}`}
      className={`block rounded-xl overflow-hidden group ${CARD.base} ${CARD.hover} ${CARD.link}`}
    >
      <div className="relative aspect-video overflow-hidden bg-olive/10">
        <Image
          src={getAttractionImage(item.id, type)}
          alt={`${item.name}, ${type} in ${item.region}—Cyprus winter`}
          fill
          className="object-cover group-hover:scale-105 transition-transform"
          sizes="(max-width: 640px) 100vw, 33vw"
        />
      </div>
      <div className={CARD.content}>
        <h3 className={`${TYPE.cardTitle} truncate`} title={item.name}>
          {item.name}
        </h3>
        <p className="text-sm text-olive/70 line-clamp-2 break-words">{item.description}</p>
      </div>
    </Link>
  );
}

export default async function RegionPage({ params }: Props) {
  const { slug } = await params;
  const config = REGION_CONFIGS.find((c) => c.slug === slug);
  if (!config) notFound();

  const regionSlug = config.slug as RegionSlug;

  const regionTrails = filterByRegion(trails, regionSlug);
  const regionVillages = filterByRegion(villages, regionSlug);
  const regionMonasteries = filterByRegion(monasteries, regionSlug);
  const regionBeaches = filterByRegion(beaches, regionSlug);
  const regionAncient = filterByRegion(ancientSites, regionSlug);
  const regionWineries = wineries.filter((w) =>
    wineryMatchesRegion(w.region, regionSlug)
  );
  const regionEventFilter: Record<RegionSlug, string | null> = {
    troodos: "Troodos",
    paphos: "Paphos",
    larnaca: "Larnaca",
    limassol: "Limassol",
    "ayia-napa": null,
  };
  const eventRegion = regionEventFilter[regionSlug];
  const regionEvents =
    eventRegion === null
      ? []
      : winterEvents.filter(
          (e) => e.region === eventRegion || e.region === "All"
        );

  return (
    <div className={`min-h-screen bg-sand ${LAYOUT.list} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        backHref="/"
        backLabel="Home"
        title={config.title}
        description={config.description}
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: config.title, href: `/regions/${config.slug}`, isCurrent: true },
        ]}
      />

      <div className="space-y-16 sm:space-y-20">
        {regionTrails.length > 0 && (
          <section aria-labelledby="trails">
            <h2
              id="trails"
              className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}
            >
              Trails
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {regionTrails.map((t) => (
                <TrailCard key={t.id} trail={t} />
              ))}
            </div>
            {regionSlug === "troodos" && (
              <p className="mt-4">
                <Link
                  href="/guides/troodos-december"
                  className={`text-sm font-medium ${SECTION.aegeanLink}`}
                >
                  Troodos trails in December →
                </Link>
              </p>
            )}
          </section>
        )}

        {regionVillages.length > 0 && (
          <section aria-labelledby="villages">
            <h2
              id="villages"
              className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}
            >
              Villages
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {regionVillages.map((v) => (
                <PlaceCard key={v.id} item={v} type="village" />
              ))}
            </div>
          </section>
        )}

        {regionBeaches.length > 0 && (
          <section aria-labelledby="beaches">
            <h2
              id="beaches"
              className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}
            >
              Beaches
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {regionBeaches.map((b) => (
                <PlaceCard key={b.id} item={b} type="beach" />
              ))}
            </div>
          </section>
        )}

        {regionAncient.length > 0 && (
          <section aria-labelledby="ancient">
            <h2
              id="ancient"
              className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}
            >
              Ancient sites
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {regionAncient.map((a) => (
                <PlaceCard key={a.id} item={a} type="ancient" />
              ))}
            </div>
          </section>
        )}

        {regionWineries.length > 0 && (
          <section aria-labelledby="wineries">
            <h2
              id="wineries"
              className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}
            >
              Wineries
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {regionWineries.slice(0, 9).map((w) => (
                <PlaceCard key={w.id} item={w} type="winery" />
              ))}
            </div>
            {regionWineries.length > 9 && (
              <p className="mt-4">
                <Link
                  href="/wineries"
                  className={`text-sm font-medium ${SECTION.aegeanLink}`}
                >
                  All Cyprus wineries →
                </Link>
              </p>
            )}
          </section>
        )}

        {regionEvents.length > 0 && (
          <section aria-labelledby="events">
            <h2
              id="events"
              className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}
            >
              Winter events
            </h2>
            <ul className="space-y-3">
              {regionEvents.map((e) => (
                <li
                  key={e.id}
                  className={`${CARD.base} ${CARD.content}`}
                >
                  <h3 className="font-medium text-olive">{e.name}</h3>
                  <p className="text-sm text-olive/80 mt-1">{e.description}</p>
                  {e.dates && (
                    <p className="text-xs text-olive/70 mt-2">{e.dates}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {regionMonasteries.length > 0 && (
          <section aria-labelledby="monasteries">
            <h2
              id="monasteries"
              className={`${TYPE.sectionTitle} ${SECTION.headingGap}`}
            >
              Monasteries & churches
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {regionMonasteries.map((m) => (
                <PlaceCard key={m.id} item={m} type="monastery" />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className={SECTION.footerBlock}>
        <p className="text-center text-olive/70 text-sm">
        <Link href="/weather" className={SECTION.aegeanLink}>
          Weather by month
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
