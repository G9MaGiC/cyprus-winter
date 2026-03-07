import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Plan Cyprus Winter | Itinerary Builder",
  description:
    "Build your Cyprus winter itinerary. Add trails, villages, wineries. Saves as you go. Plan ahead or when you land. Troodos to coast. Free itinerary builder for winter trips.",
  alternates: { canonical: `${SITE_URL}/plan` },
};

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
