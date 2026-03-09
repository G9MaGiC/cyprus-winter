import Image from "next/image";
import type { ComponentType } from "react";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import type { LinkProps } from "@/app/_home/types";
import { CARD, TYPE } from "@/lib/design-tokens";
import { homeEditorsPicks } from "@/data/home";

export default function EditorsPicks({
  LinkComponent,
}: {
  LinkComponent: ComponentType<LinkProps>;
}) {
  const Link = LinkComponent;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
      {homeEditorsPicks.map((item) => (
        <div
          key={item.id}
          className={`overflow-hidden rounded-2xl ${CARD.base} ${CARD.featured} ${CARD.hover} ${CARD.interactive} group flex flex-col`}
        >
          <Link href={item.href} prefetch="auto" className={`block flex-1 ${CARD.link}`} aria-label={`Open ${item.title}`}>
            <div className={CARD.media}>
              <Image
                src={item.image}
                alt={item.imageAlt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" aria-hidden />
            </div>
            <div className={CARD.content}>
              <h3 className={`${TYPE.cardTitle} text-charcoal truncate`} title={item.title}>{item.title}</h3>
              <p className="text-sm text-sage mt-1 leading-relaxed line-clamp-2 break-words">{item.desc}</p>
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

