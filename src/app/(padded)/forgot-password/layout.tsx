import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password | Cyprus Winter",
  description: "Request a password reset link to regain access to your account.",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
