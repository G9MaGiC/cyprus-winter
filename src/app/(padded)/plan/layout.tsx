import type { Metadata } from "next";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";

const planAlternates = buildStrategyAAlternates("/plan");

export const metadata: Metadata = {
  title: "Plan Cyprus Winter | Curated Itineraries & Trip Builder",
  description:
    "Curated Cyprus winter itineraries: 48h to 10 days. Expert pacing, winery booking tips, seasonal advice. Troodos trails, villages, coast—plan ahead or when you land. Free.",
  alternates: planAlternates,
  openGraph: {
    title: "Plan Cyprus Winter | Curated Itineraries & Trip Builder",
    description: "Curated Cyprus winter itineraries with expert pacing and winery tips. Trails, villages, coast. Plan ahead or when you land.",
    url: planAlternates.canonical,
    type: "website",
  },
};

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
