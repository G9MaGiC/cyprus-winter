"use client";

import { useEffect } from "react";
import { LAYOUT, CTA, SECTION, TYPE } from "@/lib/design-tokens";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import EmergencyLine from "@/components/EmergencyLine";

type AppErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppErrorPage({ error, reset }: AppErrorPageProps) {
  const t = useTranslations("errors.page");
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
        <h1 className={`${TYPE.sectionTitle} text-olive ${SECTION.titleGap}`}>{t("title")}</h1>
        <p className={`text-olive/80 leading-relaxed prose-body break-words ${SECTION.headingGap}`}>
          {t("body")}
        </p>
        <p className={`text-olive/70 text-sm ${SECTION.headingGap}`}>{t("hint")}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button type="button" onClick={reset} className={CTA.primaryCompact}>
            {tCommon("tryAgain")}
          </button>
          <Link href="/" className={CTA.secondaryCompact}>
            {tCommon("goHome")}
          </Link>
        </div>
        <EmergencyLine className={SECTION.blockTop} />
      </div>
    </div>
  );
}
