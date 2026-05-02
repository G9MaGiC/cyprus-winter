import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { planSegmentMeta } from "@/lib/locale-page-meta";

export const metadata: Metadata = applyLocaleToMetadata(
  planSegmentMeta,
  "/plan",
  routing.defaultLocale
);

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
