import Image from "next/image";
import Link from "next/link";
import { CARD, CTA, TYPE } from "@/lib/design-tokens";
import { homeFeaturedWineries } from "@/data/home";
import { wineries } from "@/data/wineries";

export default function BookTastings() {
  const featured = homeFeaturedWineries.map((w) => {
    const full = wineries.find((x) => x.id === w.wineryId);
    return {
      ...w,
      name: full?.name ?? w.title,
      region: full?.region ?? "Cyprus",
    };
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {featured.map((w) => (
        <div key={w.wineryId} className={`overflow-hidden ${CARD.base} ${CARD.featured} ${CARD.hover} ${CARD.interactive} group flex flex-col`}>
          <Link href={`/discover/${w.wineryId}`} className={`${CARD.link} flex-1`} aria-label={`View ${w.name}`}>
            <div className={CARD.media}>
              <Image
                src={w.image}
                alt={w.imageAlt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" aria-hidden />
            </div>
            <div className={CARD.content}>
              <p className={`${TYPE.kicker} mb-2`}>Book tastings</p>
              <h3 className="font-display text-lg font-semibold text-charcoal group-hover:text-terracotta transition-colors">
                {w.name}
              </h3>
              <p className="text-sm text-olive/70 mt-1">{w.region}</p>
              <p className="text-sm text-sage mt-3 leading-relaxed">{w.subtitle}</p>
            </div>
          </Link>
          <div className={CARD.footer}>
            <div className="flex flex-wrap gap-2">
              <Link href={`/book/winery/${w.wineryId}`} className={CTA.primaryCompact} aria-label={`Book a tasting at ${w.name}`}>
                Book a tasting
              </Link>
              <Link href="/wineries" className={CTA.secondaryCompact} aria-label="Explore all wineries">
                Explore wineries
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

