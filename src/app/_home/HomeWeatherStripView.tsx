"use client";

import {
  StatusStrip,
  StatusStripInlineStat,
  StatusStripLink,
} from "@/components/StatusStrip";

export type HomeWeatherStripViewProps = {
  aria: string;
  heading: string;
  prompt: string;
};

export default function HomeWeatherStripView({ aria, heading, prompt }: HomeWeatherStripViewProps) {
  return (
    <StatusStrip variant="sand" labelledBy="home-weather-heading">
      <StatusStripLink href="/weather" ariaLabel={aria} layout="center">
        <StatusStripInlineStat id="home-weather-heading" primary={heading} secondary={prompt} />
      </StatusStripLink>
    </StatusStrip>
  );
}
