"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AppLink from "@/components/AppLink";
import { TOKENS, MAP_ICON_SHADOW, TYPE } from "@/lib/design-tokens";
import { useTranslations } from "next-intl";

export type PlanMapItem = {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  href: string;
  day: number;
};

const DAY_COLORS = [TOKENS.terracotta, TOKENS.aegean, TOKENS.sage, TOKENS.golden] as const;

function markerIcon(day: number) {
  const color = DAY_COLORS[(day - 1) % DAY_COLORS.length];
  return L.divIcon({
    html: `<span style="
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: ${color};
      color: white;
      border-radius: 50%;
      font-weight: 600;
      font-size: 11px;
      box-shadow: ${MAP_ICON_SHADOW};
      border: 2px solid white;
    ">${day}</span>`,
    className: "custom-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const CYPRUS_CENTER: [number, number] = [34.95, 33.2];

type PlanMapProps = {
  items: PlanMapItem[];
  className?: string;
};

export default function PlanMap({ items, className = "" }: PlanMapProps) {
  const tCommon = useTranslations("common");
  if (items.length === 0) return null;

  return (
    <div
      className={`flex flex-col h-full min-h-[280px] overflow-hidden rounded-xl border border-sand-200/80 bg-sand-100/50 ${className}`}
      role="img"
      aria-label={`Map showing ${items.length} places on your itinerary`}
    >
      <MapContainer
        center={CYPRUS_CENTER}
        zoom={8}
        scrollWheelZoom
        className="flex-1 min-h-[280px] w-full z-0"
        attributionControl
      >
        <TileLayer
          attribution={`&copy; <a href="https://www.openstreetmap.org/copyright">${tCommon("map.openStreetMap")}</a>`}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {items.map((item) => (
          <Marker key={item.id} position={[item.lat, item.lng]} icon={markerIcon(item.day)}>
            <Popup>
              <div className="min-w-[200px]">
                <span className="text-xs font-medium text-olive/70">Day {item.day}</span>
                <AppLink
                  href={item.href}
                  className={`${TYPE.cardTitle} block mt-0.5 mb-1`}
                >
                  {item.name}
                </AppLink>
                <p className="text-xs text-olive/70 mb-3">{item.region}</p>
                <AppLink
                  href={item.href}
                  className="text-sm font-medium text-terracotta hover:underline"
                >
                  View details →
                </AppLink>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="shrink-0 px-4 py-2.5 bg-sand-100/80 border-t border-sand-200/70">
        <p className="text-xs text-olive/70">
          {items.length} place{items.length !== 1 ? "s" : ""} on map. Numbers = day. Tap to explore.
        </p>
      </div>
    </div>
  );
}
