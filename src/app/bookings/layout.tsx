import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "My Bookings | Cyprus Winter",
  description:
    "View and manage your Cyprus Winter winery tastings and experiences. All bookings in one place. Sync from any device. Confirmations by email.",
  alternates: { canonical: `${SITE_URL}/bookings` },
};

export default function BookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
