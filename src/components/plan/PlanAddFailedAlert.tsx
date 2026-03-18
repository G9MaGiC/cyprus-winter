import AppLink from "@/components/AppLink";
import { CTA, SECTION } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function PlanAddFailedAlert() {
  const t = useTranslations("plan.addFailedAlert");
  return (
    <div
      className="p-5 sm:p-6 rounded-2xl bg-terracotta/5 border border-terracotta/20 text-sm text-olive"
      role="alert"
      aria-live="assertive"
    >
      <p className={SECTION.titleGap}>{t("message")}</p>
      <div className="flex flex-wrap gap-3">
        <AppLink
          href="/discover"
          className={CTA.secondaryCompact}
          aria-label={t("browseDiscoverAria")}
        >
          {t("browseDiscoverLabel")}
        </AppLink>
        <AppLink href="/trails" className={CTA.secondaryCompact} aria-label={t("viewTrailsAria")}>
          {t("viewTrailsLabel")}
        </AppLink>
      </div>
    </div>
  );
}
