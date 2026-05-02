import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { accountSettingsLayoutMeta } from "@/lib/locale-page-meta";

export const metadata: Metadata = applyLocaleToMetadata(
  accountSettingsLayoutMeta,
  "/account/settings",
  routing.defaultLocale
);

export default function AccountSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
