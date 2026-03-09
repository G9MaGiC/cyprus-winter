"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { TOKENS, MAP_ICON_SHADOW } from "@/lib/design-tokens";
import AddToItineraryButton from "@/components/AddToItineraryButton";

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
  if (places.length === 0) return null;

  return (
    <div className={`flex flex-col h-full min-h-[280px] overflow-hidden ${className}`}>
      <MapContainer
        center={CYPRUS_CENTER}
        zoom={8}
        scrollWheelZoom={true}
        className="flex-1 min-h-[280px] w-full z-0"
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={placeIcon}>
            <Popup>
              <div className="min-w-[200px]">
                <Link
                  href={p.href}
                  className="font-semibold text-charcoal hover:text-terracotta block mb-1"
                >
                  {p.name}
                </Link>
                <p className="text-xs text-olive/70 mb-3">{p.region}</p>
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
                  <AddToItineraryButton placeId={p.id} label="Add to plan" className="text-sm min-h-[40px] px-4 py-2" />
                  <Link
                    href={p.href}
                    className="text-sm font-medium text-terracotta hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="shrink-0 px-4 py-3 bg-sand/60 border-t border-sand-200/70">
        <p className="text-sm text-olive/70">
          {places.length} place{places.length !== 1 ? "s" : ""} on map. Tap a marker to explore.
        </p>
      </div>
    </div>
  );
}
