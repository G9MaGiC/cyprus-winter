import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { adminStatsPageMeta } from "@/lib/locale-page-meta";

export const metadata: Metadata = applyLocaleToMetadata(
  adminStatsPageMeta,
  "/admin/stats",
  routing.defaultLocale
);

export default function AdminStatsSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
