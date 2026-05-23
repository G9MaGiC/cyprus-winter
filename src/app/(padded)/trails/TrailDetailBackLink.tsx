"use client";

import SmartBackLink from "@/components/SmartBackLink";
import { useTranslations } from "next-intl";

/** Locale-safe back link on trail detail; restores search context when `from=search`. */
export default function TrailDetailBackLink() {
  const tNav = useTranslations("nav");
  return (
    <SmartBackLink fallbackHref="/trails" fallbackLabel={tNav("trails")} />
  );
}
