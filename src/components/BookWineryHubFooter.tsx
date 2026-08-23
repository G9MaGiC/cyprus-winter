"use client";

import AppLink from "@/components/AppLink";
import HubFooter from "@/components/HubFooter";
import HubFooterSecondaryLinks from "@/components/HubFooterSecondaryLinks";
import { SECTION } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function BookWineryHubFooter() {
  const tBook = useTranslations("book.pages.wineryList");
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
          <AppLink href="/wineries" className={SECTION.aegeanLink}>
            {tBook("footerBrowseWineries")}
          </AppLink>
          <AppLink href="/book/guide" className={SECTION.aegeanLink}>
            {tBook("alsoGuides")}
          </AppLink>
          <AppLink href="/bookings" className={SECTION.aegeanLink}>
            {tBookings("title")}
          </AppLink>
        </HubFooterSecondaryLinks>
      }
    />
  );
}
