import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { absoluteUrlForLocale, applyLocaleToMetadata } from "@/lib/locale-seo";
import { eventsSegmentMeta } from "@/lib/locale-page-meta";
import { buildEventsIndexJsonLd } from "@/lib/events-index-json-ld";

export const metadata: Metadata = applyLocaleToMetadata(
  eventsSegmentMeta,
  "/events",
  routing.defaultLocale
);

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const eventsUrl = absoluteUrlForLocale("/events", routing.defaultLocale);
  const eventListSchema = buildEventsIndexJsonLd(eventsUrl);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventListSchema) }} />
      {children}
    </>
  );
}
