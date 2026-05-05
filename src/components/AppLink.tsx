"use client";

import { Link } from "@/i18n/navigation";

/**
 * Link wrapper that defaults to prefetch="auto" to avoid Next.js 16
 * prefetch+loading hang on Vercel (vercel/next.js#85162).
 */
export default function AppLink(props: React.ComponentProps<typeof Link>) {
  return <Link prefetch="auto" {...props} />;
}
