"use client";

import AppLink from "@/components/AppLink";
import HubFooter from "@/components/HubFooter";
import { WINE_ROUTES } from "@/data/wine-routes";
import { SECTION } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function WineriesHubFooter() {
  const tWineries = useTranslations("wineries.page");
  const tDiscover = useTranslations("discover");

  return (
    <HubFooter
      body={tWineries("footer.hubBody")}
      ariaLabel={tWineries("aria.actions")}
      askAiLabel={tDiscover("footer.askAi")}
      askAiAriaLabel={tDiscover("aria.askAi")}
      secondary={
        <p className="text-center text-olive/70 text-sm max-w-md mx-auto">
          {tWineries("footer.routesPrefix")}{" "}
          <AppLink href="/wine-routes" className={SECTION.aegeanLink}>
            {tWineries("footer.allRoutes")}
          </AppLink>
          {WINE_ROUTES.map((route) => (
            <span key={route.slug}>
              {" · "}
              <AppLink href={`/wine-routes/${route.slug}`} className={SECTION.aegeanLink}>
                {route.title}
              </AppLink>
            </span>
          ))}
        </p>
      }
    />
  );
}
