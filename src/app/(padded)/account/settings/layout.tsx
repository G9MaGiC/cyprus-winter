import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | My account | Cyprus Winter",
  description: "Personalize your Cyprus Winter experience. Set interests, favorite regions, and notification preferences.",
};

export default function AccountSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
