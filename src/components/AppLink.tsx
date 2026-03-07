"use client";

import NextLink from "next/link";

/**
 * Link wrapper that defaults to prefetch="auto" to avoid Next.js 16
 * prefetch+loading hang on Vercel (vercel/next.js#85162).
 */
export default function AppLink(props: React.ComponentProps<typeof NextLink>) {
  return <NextLink prefetch="auto" {...props} />;
}
