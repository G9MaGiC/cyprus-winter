import type { Metadata } from "next";
import { buildEventsIndexJsonLd } from "@/lib/events-index-json-ld";
import { toSafeJsonForScript } from "@/lib/json-script";
import { absoluteUrlForLocale, applyLocaleToMetadata } from "@/lib/locale-seo";
import { eventsSegmentMeta } from "@/lib/locale-page-meta";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return applyLocaleToMetadata(eventsSegmentMeta, "/events", locale);
}

export default async function LocaleEventsLayout({ children, params }: Props) {
  const { locale } = await params;
  const eventsUrl = absoluteUrlForLocale("/events", locale);
  const eventListSchema = buildEventsIndexJsonLd(eventsUrl);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toSafeJsonForScript(eventListSchema) }} />
      {children}
    </>
  );
}
