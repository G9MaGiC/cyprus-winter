"use client";

import AppLink from "@/components/AppLink";
import HubFooter from "@/components/HubFooter";
import HubFooterSecondaryLinks from "@/components/HubFooterSecondaryLinks";
import { SECTION } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function WeatherMonthFooter() {
  const tWeatherMonth = useTranslations("weather.month");
  const tDiscover = useTranslations("discover");

  return (
    <HubFooter
      body={tWeatherMonth("footer.hubBody")}
      ariaLabel={tWeatherMonth("aria.actions")}
      askAiLabel={tDiscover("footer.askAi")}
      askAiAriaLabel={tDiscover("aria.askAi")}
      secondary={
        <HubFooterSecondaryLinks>
          <AppLink href="/weather" className={SECTION.aegeanLink}>
            {tWeatherMonth("footer.allMonths")}
          </AppLink>
          <AppLink href="/regions/troodos" className={SECTION.aegeanLink}>
            {tWeatherMonth("footer.troodosWinter")}
          </AppLink>
        </HubFooterSecondaryLinks>
      }
    />
  );
}
