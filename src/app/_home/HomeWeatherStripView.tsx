"use client";

import AppLink from "@/components/AppLink";
import { LAYOUT, STRIP, TYPE } from "@/lib/design-tokens";

export type HomeWeatherStripViewProps = {
  aria: string;
  heading: string;
  prompt: string;
};

export default function HomeWeatherStripView({ aria, heading, prompt }: HomeWeatherStripViewProps) {
  return (
    <section
      aria-labelledby="home-weather-heading"
      className={`${LAYOUT.safeAreaX} ${STRIP.py} bg-sand-100/80 border-b border-sand-200/70`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <AppLink
          href="/weather"
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center min-h-[44px] py-2 group"
          aria-label={aria}
        >
          <span id="home-weather-heading" className={`${TYPE.cardTitle}`}>
            {heading}
          </span>
          <span className="text-sage text-sm">— {prompt}</span>
        </AppLink>
      </div>
    </section>
  );
}
