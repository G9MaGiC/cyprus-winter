"use client";

import AppLink from "@/components/AppLink";
import HubFooter from "@/components/HubFooter";
import { SECTION } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function CyclingFooter() {
  const tCycling = useTranslations("cycling.page");
  const tDiscover = useTranslations("discover");

  return (
    <HubFooter
      body={tCycling("footer.hubBody")}
      ariaLabel={tCycling("aria.actions")}
      askAiLabel={tDiscover("footer.askAi")}
      askAiAriaLabel={tDiscover("aria.askAi")}
      secondary={
        <div className="flex flex-wrap items-center justify-center gap-3">
          <AppLink href="/discover?filter=cycling" className={`text-sm font-medium ${SECTION.aegeanLink}`}>
            {tCycling("footer.discoverFilter")}
          </AppLink>
          <AppLink href="/trails" className={`text-sm font-medium ${SECTION.aegeanLink}`}>
            {tCycling("footer.trailConditions")}
          </AppLink>
        </div>
      }
    />
  );
}
