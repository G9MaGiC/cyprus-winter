import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set new password | Cyprus Winter",
  description: "Set a new password for your account.",
  robots: { index: false, follow: true },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
