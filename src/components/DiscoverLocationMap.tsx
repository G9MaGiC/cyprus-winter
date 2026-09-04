"use client";

import { useEffect, useRef, useState } from "react";
import { CTA } from "@/lib/design-tokens";

type DiscoverLocationMapProps = {
  name: string;
  latitude: number;
  longitude: number;
  iframeTitle: string;
  directionsAria: string;
  directionsCta: string;
  loadMapLabel: string;
};

export default function DiscoverLocationMap({
  name,
  latitude,
  longitude,
  iframeTitle,
  directionsAria,
  directionsCta,
  loadMapLabel,
}: DiscoverLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoad]);

  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.02}%2C${latitude - 0.015}%2C${longitude + 0.02}%2C${latitude + 0.015}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <div ref={containerRef}>
      <div className="rounded-xl overflow-hidden border border-sand-200/80 aspect-video min-h-[200px] max-w-full bg-olive/5">
        {shouldLoad ? (
          <iframe
            title={iframeTitle}
            src={embedSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <button
            type="button"
            onClick={() => setShouldLoad(true)}
            className="w-full h-full min-h-[200px] flex flex-col items-center justify-center gap-2 px-4 text-sm font-medium text-muted-ink hover:text-olive hover:bg-sand-100/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={loadMapLabel}
          >
            <svg className="w-8 h-8 text-olive/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {loadMapLabel}
            <span className="text-xs text-muted-ink font-normal">{name}</span>
          </button>
        )}
      </div>
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`gap-2 mt-3 ${CTA.secondaryCompact}`}
        aria-label={directionsAria}
      >
        {directionsCta}
      </a>
    </div>
  );
}
