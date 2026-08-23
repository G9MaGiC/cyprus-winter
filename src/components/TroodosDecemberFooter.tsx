"use client";

import AppLink from "@/components/AppLink";
import HubFooter from "@/components/HubFooter";
import HubFooterSecondaryLinks from "@/components/HubFooterSecondaryLinks";
import { SECTION } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function TroodosDecemberFooter() {
  const tGuide = useTranslations("guides.troodosDecember");
  const tDiscover = useTranslations("discover");

  return (
    <HubFooter
      body={tGuide("footer.hubBody")}
      ariaLabel={tGuide("aria.actions")}
      askAiLabel={tDiscover("footer.askAi")}
      askAiAriaLabel={tDiscover("aria.askAi")}
      secondary={
        <HubFooterSecondaryLinks>
          <AppLink href="/regions/troodos" className={SECTION.aegeanLink}>
            {tGuide("footer.troodosRegion")}
          </AppLink>
          <AppLink href="/weather" className={SECTION.aegeanLink}>
            {tGuide("footer.weatherByMonth")}
          </AppLink>
        </HubFooterSecondaryLinks>
      }
    />
  );
}
