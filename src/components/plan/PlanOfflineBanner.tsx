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
      className="rounded-xl border border-golden/30 bg-golden/10 px-4 py-3 text-sm text-olive/85 leading-relaxed"
    >
      {t("body")}
    </div>
  );
}
