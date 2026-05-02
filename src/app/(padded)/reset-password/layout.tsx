import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { resetPasswordLayoutMeta } from "@/lib/locale-page-meta";

export const metadata: Metadata = applyLocaleToMetadata(
  resetPasswordLayoutMeta,
  "/reset-password",
  routing.defaultLocale
);

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
