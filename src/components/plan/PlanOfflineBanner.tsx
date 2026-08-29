"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useTranslations } from "next-intl";

export default function PlanOfflineBanner() {
  const online = useOnlineStatus();
  const t = useTranslations("plan.offline");

  if (online) return null;

  return (
    <div
      role="status"
      className="rounded-xl border border-golden/30 bg-golden/10 px-4 py-3 text-sm text-olive/85 leading-relaxed space-y-1"
    >
      <p className="font-medium text-olive">{t("title")}</p>
      <p>{t("body")}</p>
      <p className="text-muted-ink">{t("readOnly")}</p>
    </div>
  );
}
