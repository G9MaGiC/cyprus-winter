import type { Metadata } from "next";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { partnerPortalPageMeta } from "@/lib/locale-page-meta";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return applyLocaleToMetadata(partnerPortalPageMeta, "/partner", locale);
}

export default function LocalePartnerPortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
