import "server-only";

import Image from "next/image";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import AppLink from "@/components/AppLink";
import { CARD, TYPE } from "@/lib/design-tokens";
import { getHomeEditorsPicks } from "@/app/_home/home-editors-picks-data";
import { getTranslations } from "next-intl/server";

type Props = { locale?: string };

export default async function EditorsPicks({ locale }: Props) {
  const [picks, tHome, tCommon] = await Promise.all([
    getHomeEditorsPicks(locale),
    locale ? getTranslations({ locale, namespace: "home" }) : getTranslations("home"),
    locale ? getTranslations({ locale, namespace: "common" }) : getTranslations("common"),
  ]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
      {picks.map((item) => (
        <div
          key={item.id}
          className={`overflow-hidden rounded-2xl ${CARD.base} ${CARD.featured} ${CARD.hover} ${CARD.interactive} group flex flex-col`}
        >
          <AppLink
            href={item.href}
            prefetch="auto"
            className={`block flex-1 ${CARD.link}`}
            aria-label={tHome("editorsPicksOpenAria", { title: item.title })}
          >
            <div className={CARD.media}>
              <Image
                src={item.image}
                alt={item.imageAlt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent"
                aria-hidden
              />
            </div>
            <div className={CARD.content}>
              <h3 className={`${TYPE.cardTitle} text-charcoal truncate`} title={item.title}>
                {item.title}
              </h3>
              <p className="text-sm text-sage mt-1 leading-relaxed line-clamp-2 break-words">
                {item.desc}
              </p>
            </div>
          </AppLink>
          <div className={CARD.footer}>
            <AddToItineraryButton
              placeId={item.id}
              label={tCommon("addToPlan")}
              className="text-sm"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
