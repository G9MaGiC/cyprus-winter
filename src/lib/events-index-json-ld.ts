import { winterEvents } from "@/data/events";
import { startDateForEventJsonLd } from "@/lib/event-json-ld";

/** ItemList JSON-LD for the events index; `eventsUrl` must be the canonical events page URL (any locale). */
export function buildEventsIndexJsonLd(eventsUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cyprus Winter Events",
    description:
      "Winter events in Cyprus: Epiphany, carnival, Commandaria tastings, Christmas markets, ski season, and more.",
    url: eventsUrl,
    numberOfItems: winterEvents.length,
    itemListElement: winterEvents.map((evt, i) => {
      const startDate = startDateForEventJsonLd(evt.dates);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Event",
          name: evt.name,
          description: evt.description.slice(0, 160),
          location: {
            "@type": "Place",
            name: evt.venue || evt.region,
            address: { addressLocality: evt.region, addressCountry: "CY" },
          },
          url: `${eventsUrl}#${evt.id}`,
          ...(startDate ? { startDate } : {}),
        },
      };
    }),
  };
}
