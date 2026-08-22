import type { Metadata } from "next";
import { buildEventsIndexJsonLd } from "@/lib/events-index-json-ld";
import { toSafeJsonForScript } from "@/lib/json-script";
import { SITE_URL } from "@/lib/site-url";
import { getLocale } from "next-intl/server";
import { buildTranslatedHubMetadata } from "@/lib/translated-page-meta";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildTranslatedHubMetadata("events", locale);
}

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const eventsUrl = `${SITE_URL}/events`;
  const eventListSchema = buildEventsIndexJsonLd(eventsUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(eventListSchema) }}
      />
      {children}
    </>
  );
}
