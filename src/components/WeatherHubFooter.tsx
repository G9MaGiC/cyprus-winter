"use client";

import AppLink from "@/components/AppLink";
import HubFooter from "@/components/HubFooter";
import HubFooterSecondaryLinks from "@/components/HubFooterSecondaryLinks";
import { SECTION } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function WeatherHubFooter() {
  const tWeather = useTranslations("weather.page");
  const tDiscover = useTranslations("discover");

  return (
    <HubFooter
      body={tWeather("footer.hubBody")}
      ariaLabel={tWeather("aria.actions")}
      askAiLabel={tDiscover("footer.askAi")}
      askAiAriaLabel={tDiscover("aria.askAi")}
      secondary={
        <HubFooterSecondaryLinks>
          <AppLink href="/trails" className={SECTION.aegeanLink}>
            {tWeather("footer.trails")}
          </AppLink>
          <AppLink href="/events" className={SECTION.aegeanLink}>
            {tWeather("footer.events")}
          </AppLink>
        </HubFooterSecondaryLinks>
      }
    />
  );
}
