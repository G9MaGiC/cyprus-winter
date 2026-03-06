import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan Cyprus Winter | Itinerary Builder",
  description:
    "Build your Cyprus winter itinerary. Add trails, villages, wineries. Saves as you go. Plan ahead or when you land. Troodos to coast.",
};

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
