"use client";

import AppLink from "@/components/AppLink";
import HubFooter from "@/components/HubFooter";
import { SECTION } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function NatureFooter() {
  const tNature = useTranslations("nature.page");
  const tDiscover = useTranslations("discover");

  return (
    <HubFooter
      body={tNature("footer.hubBody")}
      ariaLabel={tNature("aria.actions")}
      askAiLabel={tDiscover("footer.askAi")}
      askAiAriaLabel={tDiscover("aria.askAi")}
      secondary={
        <div className="flex flex-wrap items-center justify-center gap-3">
          <AppLink href="/trails" className={`text-sm font-medium ${SECTION.aegeanLink}`}>
            {tNature("footer.trails")}
          </AppLink>
          <AppLink href="/cycling" className={`text-sm font-medium ${SECTION.aegeanLink}`}>
            {tNature("footer.cycling")}
          </AppLink>
          <AppLink href="/discover?filter=quiet" className={`text-sm font-medium ${SECTION.aegeanLink}`}>
            {tNature("footer.quietPlaces")}
          </AppLink>
        </div>
      }
    />
  );
}
