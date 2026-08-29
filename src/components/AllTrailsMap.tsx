"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MapScrollWheelToggle from "@/components/MapScrollWheelToggle";
import MapInteractionGuard from "@/components/MapInteractionGuard";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AppLink from "@/components/AppLink";
import type { Trail } from "@/data/trails";
import { TOKENS, MAP_ICON_SHADOW, TYPE } from "@/lib/design-tokens";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

const trailIcon = L.divIcon({
  html: `<span style="
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: ${TOKENS.sage};
    color: white;
    border-radius: 50%;
    font-weight: 700;
    font-size: 11px;
    box-shadow: ${MAP_ICON_SHADOW};
    border: 2px solid white;
  ">T</span>`,
  className: "custom-marker",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

type AllTrailsMapProps = {
  trails: Trail[];
  className?: string;
};

const CYPRUS_CENTER: [number, number] = [34.95, 33.2];

export default function AllTrailsMap({ trails, className = "" }: AllTrailsMapProps) {
  const tCommon = useTranslations("common");
  const tTrails = useTranslations("trails");
  const locale = useLocale();

  const [interactive, setInteractive] = useState(() => {
    if (typeof window === "undefined") return true;
    return !(window.matchMedia?.("(pointer: coarse)").matches ?? false);
  });

  const withCoords = trails.filter((t) => t.trailheadCoords != null);
  if (withCoords.length === 0) return null;

  const formatNumber = new Intl.NumberFormat(locale).format;

  return (
    <div className={`relative flex flex-col h-full min-h-[280px] overflow-hidden rounded-xl border border-sand-200/70 bg-sand-100/50 ${className}`}>
      {!interactive && (
        <div className="absolute inset-0 z-[5] flex items-end justify-center p-3 pointer-events-none">
          <button
            type="button"
            onClick={() => setInteractive(true)}
            className="pointer-events-auto inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-full bg-white/95 border border-sand-200/80 text-sm font-medium text-olive shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={tCommon("map.enableMapAria")}
          >
            {tCommon("map.enableMapCta")}
          </button>
        </div>
      )}
      {interactive && (
        <div className="absolute top-3 right-3 z-[5]">
          <button
            type="button"
            onClick={() => setInteractive(false)}
            className="inline-flex items-center justify-center min-h-[44px] px-3 py-2 rounded-full bg-white/90 border border-sand-200/80 text-xs font-medium text-olive/80 hover:text-olive hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={tCommon("map.disableMapAria")}
          >
            {tCommon("map.disableMapCta")}
          </button>
        </div>
      )}
      <MapContainer
        center={CYPRUS_CENTER}
        zoom={8}
        scrollWheelZoom={false}
        className="flex-1 min-h-[280px] w-full z-0"
        attributionControl={true}
      >
        <MapInteractionGuard interactive={interactive} />
        <MapScrollWheelToggle />
        <TileLayer
          attribution={`&copy; <a href="https://www.openstreetmap.org/copyright">${tCommon(
            "map.openStreetMap"
          )}</a>`}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((trail) => (
          <Marker
            key={trail.id}
            position={[trail.trailheadCoords!.lat, trail.trailheadCoords!.lng]}
            icon={trailIcon}
          >
            <Popup>
              <div className="min-w-[200px]">
                <AppLink
                  href={`/trails/${trail.id}`}
                  className={`${TYPE.cardTitle} block mb-1`}
                >
                  {trail.name}
                </AppLink>
                <p className="text-xs text-olive/70 mb-3">
                  {tTrails("map.popupMeta", { region: trail.region, km: formatNumber(trail.lengthKm) })}
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
                  <AddToItineraryButton
                    placeId={trail.id}
                    label={tCommon("addToPlan")}
                    className="text-sm min-h-[44px] px-4 py-2"
                  />
                  <AppLink
                    href={`/trails/${trail.id}`}
                    className="inline-flex items-center min-h-[44px] py-2 text-sm font-medium text-terracotta hover:underline"
                  >
                    {tTrails("map.viewTrail")} →
                  </AppLink>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="shrink-0 px-4 py-2.5 bg-sand-100/80 border-t border-sand-200/70">
        <p className="text-xs text-olive/70">
          {tTrails("map.footerCount", { count: withCoords.length })}
        </p>
      </div>
    </div>
  );
}
