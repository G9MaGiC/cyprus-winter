import type { Metadata } from "next";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";
import { getTranslations } from "next-intl/server";

const planAlternates = buildStrategyAAlternates("/plan");

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("plan.meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: planAlternates,
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: planAlternates.canonical,
      type: "website",
    },
  };
}

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
