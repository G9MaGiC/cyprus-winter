"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MapScrollWheelToggle from "@/components/MapScrollWheelToggle";
import MapInteractionGuard from "@/components/MapInteractionGuard";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AppLink from "@/components/AppLink";
import { TOKENS, MAP_ICON_SHADOW, TYPE } from "@/lib/design-tokens";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { useTranslations } from "next-intl";
import { useState } from "react";

export type DiscoverMapPlace = {
  id: string;
  name: string;
  href: string;
  region: string;
  lat: number;
  lng: number;
};

const placeIcon = L.divIcon({
  html: `<span style="
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: ${TOKENS.terracotta};
    color: white;
    border-radius: 50%;
    font-weight: 600;
    font-size: 10px;
    box-shadow: ${MAP_ICON_SHADOW};
    border: 2px solid white;
  ">•</span>`,
  className: "custom-marker",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const CYPRUS_CENTER: [number, number] = [34.95, 33.2];

type DiscoverMapProps = {
  places: DiscoverMapPlace[];
  className?: string;
};

export default function DiscoverMap({ places, className = "" }: DiscoverMapProps) {
  const tCommon = useTranslations("common");
  const tDiscover = useTranslations("discover");
  const [interactive, setInteractive] = useState(() => {
    if (typeof window === "undefined") return true;
    return !(window.matchMedia?.("(pointer: coarse)").matches ?? false);
  });

  if (places.length === 0) return null;

  return (
    <div
      className={`relative flex flex-col h-full min-h-[280px] overflow-hidden ${className}`}
      role="application"
      aria-label={tDiscover("map.ariaLabel", { count: places.length })}
    >
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
            className="inline-flex items-center justify-center min-h-[36px] px-3 py-2 rounded-full bg-white/90 border border-sand-200/80 text-xs font-medium text-olive/80 hover:text-olive hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
          attribution={`&copy; <a href=\"https://www.openstreetmap.org/copyright\">${tDiscover("map.openStreetMap")}</a>`}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={placeIcon}>
            <Popup>
              <div className="min-w-[200px]">
                <AppLink
                  href={p.href}
                  className={`${TYPE.cardTitle} block mb-1`}
                >
                  {p.name}
                </AppLink>
                <p className="text-xs text-olive/70 mb-3">{p.region}</p>
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
                  <AddToItineraryButton placeId={p.id} label={tCommon("addToPlan")} className="text-sm min-h-[44px] px-4 py-2" />
<AppLink
                  href={p.href}
                  className="inline-flex items-center min-h-[44px] py-2 text-sm font-medium text-terracotta hover:underline"
                >
                    {tDiscover("map.view")}
                  </AppLink>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="shrink-0 px-4 py-3 bg-sand/60 border-t border-sand-200/70">
        <p className="text-sm text-olive/70">
          {tDiscover("map.footerCount", { count: places.length })}
        </p>
      </div>
    </div>
  );
}
