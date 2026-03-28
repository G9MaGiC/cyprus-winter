"use client";

import { useEffect } from "react";
import { LAYOUT, CTA, SECTION, TYPE } from "@/lib/design-tokens";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors.page");
  const tCommon = useTranslations("common");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} pb-[max(2rem,env(safe-area-inset-bottom))] bg-sand`}
    >
      <div className={`${LAYOUT.formNarrow} mx-auto text-center`}>
        <h1 className={`${TYPE.sectionTitle} text-olive ${SECTION.titleGap}`}>
          {t("title")}
        </h1>
        <p
          className={`text-olive/80 leading-relaxed prose-body break-words ${SECTION.headingGap}`}
        >
          {t("body")}
        </p>
        <p className={`text-olive/70 text-sm ${SECTION.headingGap}`}>
          {t("hint")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={reset}
            className={`px-6 py-3 ${CTA.primaryCompact}`}
          >
            {tCommon("tryAgain")}
          </button>
          <Link href="/" className={`px-6 py-3 ${CTA.secondaryCompact}`}>
            {tCommon("goHome")}
          </Link>
        </div>
        <p className={`${SECTION.blockTop} text-sm text-olive/60 break-words`}>
          {tCommon("emergency")} <strong>112</strong> · {tCommon("touristInfo")} <strong>1460</strong> ·{" "}
          {tCommon("ambulance")} <strong>199</strong>
        </p>
      </div>
    </main>
  );
}
