import Image from "next/image";
import type { ComponentType } from "react";
import { CARD, CTA, SECTION, TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

import { homeFeaturedWineries } from "@/data/home";
import type { LinkProps } from "@/app/_home/types";

export default function BookTastings({
  LinkComponent,
}: {
  LinkComponent: ComponentType<LinkProps>;
}) {
  const tCommon = useTranslations("common");
  const Link = LinkComponent;
  const featured = homeFeaturedWineries;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
      {featured.map((w) => (
        <div key={w.wineryId} className={`overflow-hidden rounded-2xl ${CARD.base} ${CARD.featured} ${CARD.hover} ${CARD.interactive} group flex flex-col`}>
          <Link href={`/discover/${w.wineryId}`} prefetch="auto" className={`${CARD.link} flex-1`} aria-label={`View ${w.title}`}>
            <div className={CARD.media}>
              <Image
                src={w.image}
                alt={w.imageAlt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" aria-hidden />
            </div>
            <div className={`${CARD.content} min-h-[120px]`}>
              <p className={`${TYPE.kicker} mb-2`}>{tCommon("bookTastings")}</p>
              <h3 className={`${TYPE.cardTitle} text-charcoal truncate`} title={w.title}>
                {w.title}
              </h3>
              <p className="text-sm text-olive/70 mt-1">{w.region}</p>
              <p className="text-sm text-sage mt-3 leading-relaxed line-clamp-2 break-words">{w.subtitle}</p>
            </div>
          </Link>
          <div className={CARD.footer}>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/book/winery/${w.wineryId}`}
                prefetch="auto"
                className={CTA.primaryCompact}
                aria-label={`${tCommon("bookTasting")} — ${w.title}`}
              >
                {tCommon("bookTasting")}
              </Link>
              <Link
                href="/wineries"
                prefetch="auto"
                className={`text-sm ${SECTION.aegeanLink}`}
                aria-label={tCommon("exploreWineries")}
              >
                {tCommon("exploreWineries")}
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

