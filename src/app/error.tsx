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
  const tError = useTranslations("error");
  const tCommon = useTranslations("common");

  useEffect(() => {
    console.error(error);

    // #region debug log: app error route
    fetch("http://127.0.0.1:7628/ingest/80b5b3b1-6619-475c-a7bb-fb3080a9d865", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ce8533" },
      body: JSON.stringify({
        sessionId: "ce8533",
        runId: "recheck_initial",
        hypothesisId: "A_next_error_route",
        location: "src/app/error.tsx:useEffect",
        message: "Next app error boundary rendered",
        data: {
          name: error?.name ?? "",
          message: error?.message ?? "",
          digest: error?.digest ?? "",
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [error]);

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} pb-[max(2rem,env(safe-area-inset-bottom))] bg-sand`}>
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
        <p className="mt-8 text-sm text-olive/60 break-words">
          {tCommon("emergency")} <strong>112</strong> · {tCommon("touristInfo")} <strong>1460</strong> ·{" "}
          {tCommon("ambulance")} <strong>199</strong>
        </p>
      </div>
    </main>
  );
}
