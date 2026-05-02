import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { applyLocaleToMetadata } from "@/lib/locale-seo";
import { bookingsLayoutMeta } from "@/lib/locale-page-meta";

export const metadata: Metadata = applyLocaleToMetadata(
  bookingsLayoutMeta,
  "/bookings",
  routing.defaultLocale
);

export default function BookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
