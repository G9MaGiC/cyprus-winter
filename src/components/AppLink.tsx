"use client";

import NextLink from "next/link";
import { Link as IntlLink } from "@/i18n/navigation";

function isExternal(href: string): boolean {
  if (typeof href !== "string") return false;
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

function isHashOnly(href: string): boolean {
  return typeof href === "string" && href.startsWith("#");
}

/**
 * Locale-aware link wrapper. Uses next-intl Link for internal routes (preserves locale),
 * NextLink for external URLs and hash anchors. Prefetch="auto" avoids Next.js 16
 * prefetch+loading hang (vercel/next.js#85162).
 */
export default function AppLink(props: React.ComponentProps<typeof NextLink>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- omit locale for IntlLink
  const { href, locale, ...rest } = props;
  const hrefStr = typeof href === "string" ? href : href?.toString() ?? "";

  if (isExternal(hrefStr) || isHashOnly(hrefStr)) {
    return <NextLink prefetch="auto" href={href} {...rest} />;
  }

  return <IntlLink prefetch="auto" href={href} {...rest} />;
}
