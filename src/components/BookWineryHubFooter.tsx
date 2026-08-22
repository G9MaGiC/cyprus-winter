"use client";

import AppLink from "@/components/AppLink";
import HubFooter from "@/components/HubFooter";
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
        <p className="text-center text-olive/70 text-sm max-w-md mx-auto">
          <AppLink href="/wineries" className={SECTION.aegeanLink}>
            {tBook("footerBrowseWineries")}
          </AppLink>
          {" · "}
          <AppLink href="/book/guide" className={SECTION.aegeanLink}>
            {tBook("alsoGuides")}
          </AppLink>
          {" · "}
          <AppLink href="/bookings" className={SECTION.aegeanLink}>
            {tBookings("title")}
          </AppLink>
        </p>
      }
    />
  );
}
