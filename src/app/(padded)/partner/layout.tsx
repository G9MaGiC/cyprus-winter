import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { buildTranslatedHubMetadata } from "@/lib/translated-page-meta";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return buildTranslatedHubMetadata("partner", locale);
}

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
