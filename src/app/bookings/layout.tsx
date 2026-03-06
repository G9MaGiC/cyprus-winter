import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Bookings | Cyprus Winter",
  description:
    "View your winery tastings and experiences. Cyprus Winter bookings in one place.",
};

export default function BookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
