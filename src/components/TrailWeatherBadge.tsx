"use client";

import { useEffect, useState } from "react";
import { CARD } from "@/lib/design-tokens";

type WeatherData = {
  minC: number;
  maxC: number;
  precipitationMm: number;
};

type Props = {
  lat: number;
  lng: number;
  temperatureLabel: string;
  rainLabel: string;
  liveLabel: string;
};

export default function TrailWeatherBadge({ lat, lng, temperatureLabel, rainLabel, liveLabel }: Props) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/weather?lat=${lat}&lng=${lng}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.minC != null && data?.maxC != null) {
          setWeather({ minC: data.minC, maxC: data.maxC, precipitationMm: data.precipitationMm ?? 0 });
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [lat, lng]);

  if (!weather) return null;

  return (
    <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm ${CARD.base} bg-sand-100/80`}>
      <span className="font-medium text-olive">
        {temperatureLabel.replace("{min}", String(weather.minC)).replace("{max}", String(weather.maxC))}
      </span>
      {weather.precipitationMm > 0 && (
        <span className="text-aegean/80">{rainLabel}</span>
      )}
      <span className="text-olive/50 text-xs">{liveLabel}</span>
    </div>
  );
}
