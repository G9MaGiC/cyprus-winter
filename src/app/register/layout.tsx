import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account | Cyprus Winter",
  description: "Create a free account to sync your plan and bookings across devices.",
  robots: { index: false, follow: true },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
