import type { Metadata } from "next";
import { buildTranslatedHubMetadata } from "@/lib/translated-page-meta";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildTranslatedHubMetadata("partner", locale);
}

export default function LocalePartnerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
