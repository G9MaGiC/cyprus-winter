"use client";

import SmartBackLink from "@/components/SmartBackLink";
import { useTranslations } from "next-intl";

/** Locale-safe back link on discover detail; restores search context when `from=search`. */
export default function DiscoverDetailBackLink() {
  const tNav = useTranslations("nav");
  return (
    <SmartBackLink fallbackHref="/discover" fallbackLabel={tNav("discover")} />
  );
}
