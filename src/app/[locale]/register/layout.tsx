import type { Metadata } from "next";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { registerLayoutMeta } from "@/lib/locale-page-meta";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return applyLocaleToMetadata(registerLayoutMeta, "/register", locale);
}

export default function LocaleRegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
