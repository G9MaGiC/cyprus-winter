"use client";

import AppLink from "@/components/AppLink";
import HubFooter from "@/components/HubFooter";
import { CTA } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export default function AirportFooter() {
  const tAirport = useTranslations("airport.page");

  return (
    <HubFooter
      body={tAirport("footer.body")}
      ariaLabel={tAirport("aria.actions")}
      primaryHref="/plan?template=short-stay"
      primaryTestId="airport-footer-plan48-cta"
      primaryLabel={tAirport("hero.plan48Cta")}
      askAiLabel={tAirport("footer.askAi")}
      askAiAriaLabel={tAirport("footer.askAiAria")}
      analyticsPage="/airport"
      secondary={
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
          <AppLink
            href="/plan?template=classic-7"
            data-testid="airport-footer-planweek-cta"
            className={CTA.secondaryCompact}
          >
            {tAirport("footer.planWeekCta")}
          </AppLink>
          <AppLink href="/discover" data-testid="airport-footer-discover-cta" className={CTA.secondaryCompact}>
            {tAirport("footer.discoverCta")}
          </AppLink>
          <AppLink href="/weather" data-testid="airport-footer-weather-cta" className={CTA.secondaryCompact}>
            {tAirport("footer.weatherCta")}
          </AppLink>
        </div>
      }
    />
  );
}
