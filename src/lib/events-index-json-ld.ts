import { winterEvents } from "@/data/events";
import { truncateForSchema } from "@/lib/schema-text";
import { startDateForEventJsonLd } from "@/lib/event-json-ld";

// schema.org Schedule.byMonth (1–12). The data holds a month, never a made-up
// date — emit a truthful eventSchedule instead of fabricating startDate
// (seasonal-discipline rule; AUD E2-06).
const MONTH_TO_NUMBER: Record<string, number> = {
  Nov: 11,
  Dec: 12,
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
};

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
          description: truncateForSchema(evt.description),
          location: {
            "@type": "Place",
            name: evt.venue || evt.region,
            address: { addressLocality: evt.region, addressCountry: "CY" },
          },
          url: `${eventsUrl}#${evt.id}`,
          ...(startDate ? { startDate } : {}),
          ...(!startDate && MONTH_TO_NUMBER[evt.month]
            ? {
                eventSchedule: {
                  "@type": "Schedule",
                  byMonth: [MONTH_TO_NUMBER[evt.month]],
                },
              }
            : {}),
        },
      };
    }),
  };
}
