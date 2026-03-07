import type { Metadata } from "next";
import { winterEvents } from "@/data/events";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Cyprus Winter Events | Epiphany, Carnival, Markets",
  description:
    "Epiphany, carnival, Commandaria tastings, Christmas markets. What's on when you're here. Cyprus doesn't shut down when the sun dips. Plan your winter visit.",
  alternates: { canonical: `${SITE_URL}/events` },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const eventsUrl = `${SITE_URL}/events`;

  const eventListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cyprus Winter Events",
    description: "Winter events in Cyprus: Epiphany, carnival, Commandaria tastings, Christmas markets, ski season, and more.",
    url: eventsUrl,
    numberOfItems: winterEvents.length,
    itemListElement: winterEvents.map((evt, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Event",
        name: evt.name,
        description: evt.description.slice(0, 160),
        location: { "@type": "Place", name: evt.venue || evt.region, address: { addressLocality: evt.region, addressCountry: "CY" } },
        url: `${eventsUrl}#${evt.id}`,
        ...(evt.dates && { startDate: evt.dates }),
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventListSchema) }} />
      {children}
    </>
  );
}
