"use client";

import AppLink from "@/components/AppLink";
import HubFooter from "@/components/HubFooter";
import HubFooterSecondaryLinks from "@/components/HubFooterSecondaryLinks";
import { WINE_ROUTES } from "@/data/wine-routes";
import { SECTION } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function WineriesHubFooter() {
  const tWineries = useTranslations("wineries.page");
  const tDiscover = useTranslations("discover");
  const tRoutes = useTranslations("wineRoutes.routeNames");

  return (
    <HubFooter
      body={tWineries("footer.hubBody")}
      ariaLabel={tWineries("aria.actions")}
      askAiLabel={tDiscover("footer.askAi")}
      askAiAriaLabel={tDiscover("aria.askAi")}
      secondary={
        <HubFooterSecondaryLinks>
          <span>{tWineries("footer.routesPrefix")}</span>
          <AppLink href="/wine-routes" className={SECTION.aegeanLink}>
            {tWineries("footer.allRoutes")}
          </AppLink>
          {WINE_ROUTES.map((route) => (
            <AppLink key={route.slug} href={`/wine-routes/${route.slug}`} className={SECTION.aegeanLink}>
              {tRoutes(route.slug)}
            </AppLink>
          ))}
        </HubFooterSecondaryLinks>
      }
    />
  );
}
