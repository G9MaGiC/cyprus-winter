import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { loginLayoutMeta } from "@/lib/locale-page-meta";

export const metadata: Metadata = applyLocaleToMetadata(loginLayoutMeta, "/login", routing.defaultLocale);

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
