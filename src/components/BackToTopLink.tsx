"use client";

import { CTA } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function BackToTopLink() {
  const tCommon = useTranslations("common");
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`${CTA.tertiaryOnDark} hover:bg-transparent uppercase tracking-wider`}
    >
      {tCommon("backToTop")}
    </button>
  );
}
