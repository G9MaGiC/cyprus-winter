"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AppLink from "@/components/AppLink";
import type { Trail } from "@/data/trails";
import { TOKENS, MAP_ICON_SHADOW } from "@/lib/design-tokens";
import AddToItineraryButton from "@/components/AddToItineraryButton";
import { useLocale, useTranslations } from "next-intl";

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
  ">⛰</span>`,
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

  const withCoords = trails.filter((t) => t.trailheadCoords != null);
  if (withCoords.length === 0) return null;

  const formatNumber = new Intl.NumberFormat(locale).format;

  return (
    <div className={`flex flex-col h-full min-h-[280px] overflow-hidden rounded-xl border border-sand-200/70 bg-sand-100/50 ${className}`}>
      <MapContainer
        center={CYPRUS_CENTER}
        zoom={8}
        scrollWheelZoom={true}
        className="flex-1 min-h-[280px] w-full z-0"
        attributionControl={true}
      >
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
                  className="font-semibold text-charcoal hover:text-terracotta block mb-1"
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
