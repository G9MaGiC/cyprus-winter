import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Plan Cyprus Winter | Itinerary Builder",
  description:
    "Build your Cyprus winter itinerary. Add trails, villages, wineries. Saves as you go. Plan ahead or when you land. Troodos to coast. Sixteen degrees when home is six. Free.",
  alternates: { canonical: `${SITE_URL}/plan` },
  openGraph: {
    title: "Plan Cyprus Winter | Itinerary Builder",
    description: "Build your Cyprus winter itinerary. Add trails, villages, wineries. Saves as you go. Troodos to coast.",
    url: `${SITE_URL}/plan`,
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
