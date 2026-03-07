import Link from "next/link";
import Image from "next/image";
import type { Attraction } from "@/data/attractions";
import type { Winery } from "@/data/wineries";
import type { Restaurant } from "@/data/restaurants";
import { getAttractionImage } from "@/lib/cyprus-images";
import { CARD } from "@/lib/design-tokens";

export default function AttractionCard({ a }: { a: Attraction | Winery | Restaurant }) {
  const typeColors: Record<string, string> = {
    beach: "bg-aegean/20 text-aegean",
    ancient: "bg-terracotta/20 text-terracotta",
    village: "bg-olive/20 text-olive",
    monastery: "bg-golden/30 text-charcoal",
    nature: "bg-sage/30 text-olive",
    winery: "bg-terracotta/20 text-terracotta",
    restaurant: "bg-golden/20 text-charcoal",
  };
  const badge = typeColors[a.type] ?? "bg-sand-100 text-olive/80";
  const isSustainable = ["village", "monastery", "nature", "winery"].includes(a.type);
  const badgeLabel = a.type === "restaurant" ? "Eat" : a.type;

  const isWinery = a.type === "winery";

  return (
    <div className={`group rounded-xl overflow-hidden ${CARD.base} ${CARD.hover} active:scale-[0.99] motion-reduce:active:scale-100 transition-transform`}>
      <Link
        href={`/discover/${a.id}`}
        className={`block ${CARD.link}`}
        aria-label={`${a.name}, ${a.type} in ${a.region}`}
      >
        <div className="aspect-[4/3] relative overflow-hidden bg-sand-200/50 shrink-0">
          <Image
            src={getAttractionImage(a.id, a.type)}
            alt={`${a.name}, ${a.region}—${a.type} in Cyprus winter light`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) calc(100vw - 3rem), (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${badge}`}
            >
              {badgeLabel}
            </span>
            {isSustainable && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-sage/20 text-olive/80">
                Local
              </span>
            )}
            {isWinery && (a as Winery).isVerified && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-aegean/20 text-aegean" title="Verified partner: receives booking requests directly">
                Verified partner
              </span>
            )}
          </div>
          <span className="absolute bottom-3 left-3 right-3 text-white font-medium text-sm drop-shadow-md truncate block">
            {a.region}
          </span>
        </div>
        <div className={CARD.content}>
          <h3 className="font-display text-lg font-semibold text-olive group-hover:text-terracotta transition-colors duration-200 truncate" title={a.name}>
            {a.name}
          </h3>
          <p className="text-sm text-olive/70 mt-1 line-clamp-2 break-words">
            {a.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {a.highlights.slice(0, 3).map((h) => (
              <span
                key={h}
                className="text-xs px-2.5 py-1 rounded-full bg-sand-200/70 text-olive/80 truncate min-w-0 max-w-[140px]"
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      </Link>
      {isWinery && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-2">
          <Link
            href={`/book/winery/${a.id}`}
            className="inline-flex items-center min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium bg-terracotta text-white hover:bg-terracotta-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={`Book a tasting at ${a.name}`}
          >
            Book a tasting
          </Link>
        </div>
      )}
    </div>
  );
}
