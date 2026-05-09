import type { Metadata } from "next";
import { buildStrategyAAlternates } from "@/lib/seo-locale-urls";

export const metadata: Metadata = {
  title: "My Bookings | Cyprus Winter",
  description:
    "View and manage your Cyprus Winter winery tastings and experiences. All bookings in one place. Sync from any device. Confirmations by email.",
  alternates: buildStrategyAAlternates("/bookings"),
  robots: { index: false, follow: true },
};

export default function BookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
