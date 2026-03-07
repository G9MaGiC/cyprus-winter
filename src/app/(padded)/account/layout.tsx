import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My account | Cyprus Winter",
  description:
    "Sign in to sync your plan and bookings across devices. Your itinerary and tasting requests will follow you wherever you go.",
  robots: { index: false, follow: true },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
