import { CARD, SECTION } from "@/lib/design-tokens";
import type { Attraction } from "@/data/attractions";
import type { Restaurant } from "@/data/restaurants";

type DetailPracticalInfoProps = {
  a: Attraction | Restaurant;
  tDetail: (key: string) => string;
};

export default function DetailPracticalInfo({ a, tDetail }: DetailPracticalInfoProps) {
  const hasContent =
    a.openingHours ||
    ("transport" in a && a.transport) ||
    ("parking" in a && a.parking) ||
    ("accessibility" in a && a.accessibility);

  if (!hasContent) return null;

  return (
    <section className={`${CARD.base} ${CARD.contentLg} bg-sand-100/90 border-sand-200/80 space-y-3`}>
      <h2 className={`text-xs font-semibold uppercase tracking-widest text-muted-ink ${SECTION.headingGap}`}>
        {tDetail("practical.title")}
      </h2>
      {a.openingHours && (
        <p className="text-base text-olive/90 break-words"><strong>{tDetail("practical.hours")}</strong> {a.openingHours}</p>
      )}
      {"transport" in a && a.transport && (
        <p className="text-base text-olive/90 break-words"><strong>{tDetail("practical.transport")}</strong> {a.transport}</p>
      )}
      {"parking" in a && a.parking && (
        <p className="text-base text-olive/90 break-words"><strong>{tDetail("practical.parking")}</strong> {a.parking}</p>
      )}
      {"accessibility" in a && a.accessibility && (
        <p className="text-base text-olive/90 break-words"><strong>{tDetail("practical.accessibility")}</strong> {a.accessibility}</p>
      )}
    </section>
  );
}
