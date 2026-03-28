import { LAYOUT, CTA, SECTION, TYPE } from "@/lib/design-tokens";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const tNotFound = useTranslations("notFound");
  const tCommon = useTranslations("common");

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} pb-[max(2rem,env(safe-area-inset-bottom))] bg-sand`}>
      <div className={`${LAYOUT.formNarrow} mx-auto text-center`}>
        <h1 className={`${TYPE.sectionTitle} text-olive ${SECTION.titleGap}`}>
          {tNotFound("title")}
        </h1>
        <p className="text-olive/60 text-sm mb-2" aria-hidden="true">404</p>
        <p className={`text-olive/80 leading-relaxed prose-body break-words ${SECTION.headingGap}`}>
          {tNotFound("body")}
        </p>
        <p className={`text-olive/70 text-sm ${SECTION.headingGap}`}>
          {tNotFound("hint")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className={`px-6 py-3 ${CTA.primaryCompact}`}>
            {tCommon("goHome")}
          </Link>
          <Link href="/discover" className={`px-6 py-3 ${CTA.secondaryCompact}`}>
            {tNotFound("discoverCyprus")}
          </Link>
          <Link href="/search" className={`px-6 py-3 text-sm text-olive/70 hover:text-terracotta transition-colors inline-flex items-center justify-center min-h-[44px] rounded-lg`}>
            {tNotFound("searchCyprus")}
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
