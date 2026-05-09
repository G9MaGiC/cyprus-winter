import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { forgotPasswordLayoutMeta } from "@/lib/locale-page-meta";

export const metadata: Metadata = applyLocaleToMetadata(
  forgotPasswordLayoutMeta,
  "/forgot-password",
  routing.defaultLocale
);

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
