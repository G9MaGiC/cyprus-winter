import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { partnerPortalPageMeta } from "@/lib/locale-page-meta";

export const metadata: Metadata = applyLocaleToMetadata(
  partnerPortalPageMeta,
  "/partner",
  routing.defaultLocale
);

export default function PartnerPortalSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
