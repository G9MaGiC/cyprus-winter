import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { trailsListPageMeta } from "@/lib/locale-page-meta";
import TrailsClient from "./TrailsClient";
import { getTrailsItemListSchema } from "@/lib/trails-schema";

export const metadata: Metadata = applyLocaleToMetadata(
  trailsListPageMeta,
  "/trails",
  routing.defaultLocale
);

export default function TrailsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getTrailsItemListSchema()) }} />
      <TrailsClient />
    </>
  );
}
