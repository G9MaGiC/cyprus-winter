"use client";

import AppLink from "@/components/AppLink";
import HubFooter from "@/components/HubFooter";
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
          {" · "}
          <AppLink href="/wine-routes/krasochoria" className={SECTION.aegeanLink}>
            Krasochoria
          </AppLink>
          {" · "}
          <AppLink href="/wine-routes/laona" className={SECTION.aegeanLink}>
            Laona
          </AppLink>
          {" · "}
          <AppLink href="/wine-routes/akamas" className={SECTION.aegeanLink}>
            Akamas
          </AppLink>
          {" · "}
          <AppLink href="/wine-routes/commandaria" className={SECTION.aegeanLink}>
            Commandaria
          </AppLink>
        </p>
      }
    />
  );
}
