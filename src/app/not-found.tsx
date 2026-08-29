import { LAYOUT, CTA, SECTION, TYPE } from "@/lib/design-tokens";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import EmergencyLine from "@/components/EmergencyLine";

export default function NotFound() {
  const tNotFound = useTranslations("notFound");
  const tCommon = useTranslations("common");

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${LAYOUT.safeAreaX} ${LAYOUT.pagePy} pb-[max(2rem,env(safe-area-inset-bottom))] bg-sand`} role="alert">
      <div className={`${LAYOUT.formNarrow} mx-auto text-center`}>
        <h1 className={`${TYPE.sectionTitle} text-olive ${SECTION.titleGap}`}>
          {tNotFound("title")}
        </h1>
        <p className="text-muted-ink text-sm mb-2" aria-hidden="true">404</p>
        <p className={`text-muted-ink leading-relaxed prose-body break-words ${SECTION.headingGap}`}>
          {tNotFound("body")}
        </p>
        <p className={`text-muted-ink text-sm ${SECTION.headingGap}`}>
          {tNotFound("hint")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className={CTA.primaryCompact}>
            {tCommon("goHome")}
          </Link>
          <Link href="/discover" className={CTA.secondaryCompact}>
            {tNotFound("discoverCyprus")}
          </Link>
        </div>
        <EmergencyLine className="mt-8" />
      </div>
    </div>
  );
}
