"use client";

import SmartBackLink from "@/components/SmartBackLink";
import { useTranslations } from "next-intl";

type Props = {
  wineryId: string;
  wineryName: string;
};

/** Context-aware back from book tasting form (plan, discover, wineries, book list). */
export default function BookWineryBackLink({ wineryId, wineryName }: Props) {
  const tCommon = useTranslations("common");
  return (
    <SmartBackLink
      fallbackHref={`/discover/${wineryId}`}
      fallbackLabel={tCommon("backTo", { label: wineryName })}
    />
  );
}
