import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { accountLayoutMeta } from "@/lib/locale-page-meta";

export const metadata: Metadata = applyLocaleToMetadata(
  accountLayoutMeta,
  "/account",
  routing.defaultLocale
);

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
