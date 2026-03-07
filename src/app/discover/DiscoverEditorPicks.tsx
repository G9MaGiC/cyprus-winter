import Image from "next/image";
import Link from "next/link";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { CARD, TYPE } from "@/lib/design-tokens";
import { discoverEditorsPicks } from "@/data/home";

export default function DiscoverEditorPicks() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {discoverEditorsPicks.map((item) => (
        <div
          key={item.id}
          className={`overflow-hidden ${CARD.base} ${CARD.featured} ${CARD.hover} ${CARD.interactive} group flex flex-col`}
        >
          <Link href={item.href} className={`block flex-1 ${CARD.link}`} aria-label={`Open ${item.title}`}>
            <div className={CARD.media}>
              <Image
                src={item.image}
                alt={item.imageAlt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" aria-hidden />
            </div>
            <div className={CARD.content}>
              <h3 className={`${TYPE.cardTitle} text-charcoal`}>{item.title}</h3>
              <p className="text-sm text-sage mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </Link>
          <div className={CARD.footer}>
            <AddToItineraryButton placeId={item.id} label="Add to plan" className="text-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
