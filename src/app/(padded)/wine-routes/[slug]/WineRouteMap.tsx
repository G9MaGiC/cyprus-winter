"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MapScrollWheelToggle from "@/components/MapScrollWheelToggle";
import MapInteractionGuard from "@/components/MapInteractionGuard";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Winery } from "@/data/wineries";
import { TOKENS, MAP_ICON_SHADOW, TYPE } from "@/lib/design-tokens";
import AppLink from "@/components/AppLink";
import { useTranslations } from "next-intl";
import { useState } from "react";

const wineryIcon = L.divIcon({
  html: `<span style="
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: ${TOKENS.golden};
    color: white;
    border-radius: 50%;
    font-weight: 700;
    font-size: 12px;
    box-shadow: ${MAP_ICON_SHADOW};
    border: 2px solid white;
  ">🍷</span>`,
  className: "custom-marker",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

type WineRouteMapProps = {
  routeTitle: string;
  center: { lat: number; lng: number };
  wineries: Winery[];
};

export default function WineRouteMap({ routeTitle, center, wineries }: WineRouteMapProps) {
  const tCommon = useTranslations("common");
  const tPage = useTranslations("wineRoutes.page");

  const wineriesWithCoords = wineries.filter(
    (w) => typeof w.latitude === "number" && typeof w.longitude === "number"
  );
  const [interactive, setInteractive] = useState(() => {
    if (typeof window === "undefined") return true;
    return !(window.matchMedia?.("(pointer: coarse)").matches ?? false);
  });

  if (wineriesWithCoords.length === 0) return null;

  return (
    <section aria-labelledby="wine-route-map-heading" className="mt-10">
      <h2 id="wine-route-map-heading" className={`${TYPE.kicker} text-olive/70 mb-3`}>
        {tPage("map.heading", { route: routeTitle, count: wineriesWithCoords.length })}
      </h2>
      <div
        className="relative overflow-hidden rounded-xl border border-sand-200/70 bg-sand-100/50"
        role="application"
        aria-label={tPage("map.ariaLabel", { count: wineriesWithCoords.length })}
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
              className="inline-flex items-center justify-center min-h-[44px] px-3 py-2 rounded-full bg-white/90 border border-sand-200/80 text-xs font-medium text-olive/80 hover:text-olive hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={tCommon("map.disableMapAria")}
            >
              {tCommon("map.disableMapCta")}
            </button>
          </div>
        )}
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={11}
          scrollWheelZoom={false}
          className="h-[280px] sm:h-[340px] w-full z-0"
          attributionControl
        >
          <MapInteractionGuard interactive={interactive} />
          <MapScrollWheelToggle />
          <TileLayer
            attribution={`&copy; <a href="https://www.openstreetmap.org/copyright">${tCommon(
              "map.openStreetMap"
            )}</a>`}
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {wineriesWithCoords.map((w) => (
            <Marker key={w.id} position={[w.latitude!, w.longitude!]} icon={wineryIcon}>
              <Popup>
                <div className="min-w-[200px]">
                  <AppLink href={`/discover/${w.id}`} className={`${TYPE.cardTitle} block mb-1`}>
                    {w.name}
                  </AppLink>
                  <p className="text-xs text-olive/70 mb-3">{w.region}</p>
                  <AppLink
                    href={`/discover/${w.id}`}
                    className="inline-flex items-center min-h-[44px] py-2 text-sm font-medium text-terracotta hover:underline"
                  >
                    {tPage("map.viewWinery")} →
                  </AppLink>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <p className="mt-2 text-xs text-olive/60">{tPage("map.caption")}</p>
    </section>
  );
}

