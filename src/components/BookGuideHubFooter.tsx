"use client";

import AppLink from "@/components/AppLink";
import HubFooter from "@/components/HubFooter";
import HubFooterSecondaryLinks from "@/components/HubFooterSecondaryLinks";
import { SECTION } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function BookGuideHubFooter() {
  const tBook = useTranslations("book.pages.guideList");
  const tBookings = useTranslations("bookings");
  const tDiscover = useTranslations("discover");

  return (
    <HubFooter
      body={tBook("footer.hubBody")}
      ariaLabel={tBook("aria.actions")}
      askAiLabel={tDiscover("footer.askAi")}
      askAiAriaLabel={tDiscover("aria.askAi")}
      secondary={
        <HubFooterSecondaryLinks>
          <AppLink href="/trails" className={SECTION.aegeanLink}>
            {tBook("footerBrowseTrails")}
          </AppLink>
          <AppLink href="/guides/directory" className={SECTION.aegeanLink}>
            {tBook("browseLicensedDirectory")}
          </AppLink>
          <AppLink href="/bookings" className={SECTION.aegeanLink}>
            {tBookings("title")}
          </AppLink>
        </HubFooterSecondaryLinks>
      }
    />
  );
}
