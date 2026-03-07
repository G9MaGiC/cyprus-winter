import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | Cyprus Winter",
  description: "Sign in to sync your plan and bookings across devices.",
  robots: { index: false, follow: true },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
