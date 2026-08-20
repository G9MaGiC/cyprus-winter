"use client";

import { useEffect } from "react";
import { LAYOUT, CTA, SECTION, TYPE } from "@/lib/design-tokens";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import EmergencyLine from "@/components/EmergencyLine";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const tError = useTranslations("error");
  const tCommon = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} pb-[max(2rem,env(safe-area-inset-bottom))] bg-sand`}
      role="alert"
    >
      <div className={`${LAYOUT.formNarrow} mx-auto text-center`}>
        <h1 className={`${TYPE.sectionTitle} text-olive ${SECTION.titleGap}`}>
          {tError("title")}
        </h1>
        <p className={`text-olive/80 leading-relaxed prose-body break-words ${SECTION.headingGap}`}>
          {tError("body")}
        </p>
        <p className={`text-olive/70 text-sm ${SECTION.headingGap}`}>
          {tError("hint")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={reset}
            className={`px-6 py-3 ${CTA.primaryCompact}`}
          >
            {tCommon("tryAgain")}
          </button>
          <Link
            href="/"
            className={`px-6 py-3 ${CTA.secondaryCompact}`}
          >
            {tCommon("goHome")}
          </Link>
        </div>
        <EmergencyLine className={SECTION.blockTop} />
      </div>
    </div>
  );
}
