"use client";

import AppLink from "@/components/AppLink";
import HubFooter from "@/components/HubFooter";
import HubFooterSecondaryLinks from "@/components/HubFooterSecondaryLinks";
import { SECTION } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function GuidesDirectoryFooter() {
  const tGuides = useTranslations("guides.directory");
  const tDiscover = useTranslations("discover");

  return (
    <HubFooter
      body={tGuides("footer.hubBody")}
      ariaLabel={tGuides("aria.actions")}
      askAiLabel={tDiscover("footer.askAi")}
      askAiAriaLabel={tDiscover("aria.askAi")}
      secondary={
        <HubFooterSecondaryLinks>
          <AppLink href="/book/guide" className={SECTION.aegeanLink}>
            {tGuides("verifiedPartnersLink")}
          </AppLink>
          <AppLink href="/trails" className={SECTION.aegeanLink}>
            {tGuides("footer.trails")}
          </AppLink>
        </HubFooterSecondaryLinks>
      }
    />
  );
}
