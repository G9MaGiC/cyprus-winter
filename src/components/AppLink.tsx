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
 * NextLink for external URLs and hash anchors. Prefetch="auto" on same-locale links
 * avoids Next.js 16 prefetch+loading hang (vercel/next.js#85162). Omits prefetch when
 * `locale` is set (locale switcher) — next-intl does not support prefetch with `locale`.
 */
export default function AppLink(props: React.ComponentProps<typeof NextLink>) {
  const { href, locale, prefetch, ...rest } = props;
  const hrefStr = typeof href === "string" ? href : href?.toString() ?? "";
  const localeSwitch = typeof locale === "string";
  const resolvedPrefetch = prefetch ?? "auto";

  if (isExternal(hrefStr) || isHashOnly(hrefStr)) {
    return <NextLink prefetch={resolvedPrefetch} href={href} {...rest} />;
  }

  return (
    <IntlLink
      href={href}
      {...rest}
      {...(localeSwitch ? { locale } : { prefetch: resolvedPrefetch })}
    />
  );
}
