"use client";

import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import RightNowCard from "@/components/RightNowCard";
import AppLink from "@/components/AppLink";
import LocationActionButtons from "@/components/LocationActionButtons";
import RegionPickerChips from "@/components/RegionPickerChips";
import { getRegionShortLabel, type RegionSlug } from "@/data/regions";
import { useRightNowFeed } from "@/hooks/useRightNowFeed";
import { useUserPreferences } from "@/hooks/useUserPreferences";

type DistanceMode = "less" | "more";

function SectionShell({
  children,
  title = "Right now near you",
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <section
      id="right-now"
      aria-labelledby="right-now-heading"
      className={`${SECTION.pySub} ${LAYOUT.safeAreaX} bg-sand/50`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <header className="mb-4 sm:mb-5">
          <h2 id="right-now-heading" className={`${TYPE.sectionTitle} ${SECTION.titleGap}`}>
            {title}
          </h2>
          {subtitle && <p className="text-sm text-olive/70">{subtitle}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

function DistanceToggle({
  value,
  onChange,
}: {
  value: DistanceMode;
  onChange: (v: DistanceMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Distance"
      className="inline-flex rounded-lg border border-sand-200/80 bg-sand-50/60 p-0.5 gap-px"
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange("less");
        }}
        className={`min-h-[44px] px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          value === "less"
            ? "bg-white text-olive shadow-sm"
            : "text-olive/70 hover:text-olive"
        }`}
      >
        Closer
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange("more");
        }}
        className={`min-h-[44px] px-3 py-2 text-sm font-medium rounded-md transition-colors ${
          value === "more"
            ? "bg-white text-olive shadow-sm"
            : "text-olive/70 hover:text-olive"
        }`}
      >
        Farther
      </button>
    </div>
  );
}

type RightNowNearYouProps = { title?: string };

export default function RightNowNearYou({
  title = "Right now near you",
}: RightNowNearYouProps) {
  const {
    state,
    items,
    lastErrorCode,
    distanceMode,
    sourceMode,
    selectedRegion,
    handleUseLocation,
    handlePickRegion,
    handleRegionSelect,
    handleDistanceChange,
  } = useRightNowFeed();
  const { prefs, hydrated } = useUserPreferences();
  const suggestedRegion = hydrated && prefs.favoriteRegions[0] ? (prefs.favoriteRegions[0] as RegionSlug) : null;

  if (state === "consent") {
    return (
      <SectionShell title={title}>
          <div className="rounded-xl border border-sand-200/70 p-5 sm:p-6 bg-white/90 shadow-sm">
          <p className="text-olive/80 text-sm mb-4">
            Suggestions based on where you are, the time, and the weather.
          </p>
          <LocationActionButtons
            primaryLabel="Use my location"
            onPrimary={handleUseLocation}
            onSecondary={handlePickRegion}
            secondaryLabel="Pick a region"
            className="mt-0"
          />
        </div>
      </SectionShell>
    );
  }

  if (state === "region-picker") {
    return (
      <SectionShell title={title}>
          <div className="rounded-xl border border-sand-200/70 p-5 sm:p-6 bg-white/90 shadow-sm">
          <p className="text-olive/80 text-sm mb-4">Choose a region to explore.</p>
          <RegionPickerChips
            onSelect={handleRegionSelect}
            onUseLocation={handleUseLocation}
            suggestedRegion={suggestedRegion}
          />
        </div>
      </SectionShell>
    );
  }

  if (state === "loading") {
    return (
      <SectionShell title={title}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden border border-sand-200/60 bg-white flex sm:block"
              aria-hidden
            >
              <div className="w-20 h-20 sm:w-full sm:aspect-[4/3] shrink-0 bg-olive/10 animate-pulse" />
              <div className="flex-1 p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
                <div className="h-3.5 sm:h-4 w-3/4 bg-olive/20 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-olive/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    );
  }

  if (state === "denied" || state === "error") {
    const errorMessage =
      state === "denied"
        ? "Enable location or pick a region."
        : lastErrorCode === "rate_limited"
          ? "Too many requests. Try again in a minute."
          : "Couldn't load. Try again shortly.";
    return (
      <SectionShell title={title}>
          <div className="rounded-xl border border-sand-200/70 p-5 sm:p-6 bg-white/90 shadow-sm">
          <p className="text-olive/80 text-sm mb-4">{errorMessage}</p>
          <LocationActionButtons
            primaryLabel="Try again"
            onPrimary={handleUseLocation}
            onSecondary={handlePickRegion}
            secondaryLabel="Pick a region"
            className="mt-0"
          />
        </div>
      </SectionShell>
    );
  }

  if (state === "empty") {
    const subtitle =
      sourceMode === "region" && selectedRegion
        ? `Suggestions in ${getRegionShortLabel(selectedRegion)}`
        : undefined;
    return (
      <SectionShell title={title} subtitle={subtitle}>
          <div className="rounded-xl border border-sand-200/70 p-5 sm:p-6 bg-white/90 shadow-sm">
          <p className="text-olive/80 text-sm mb-4">
            No suggestions for {sourceMode === "region" ? "this region" : "now"}{" "}
            right now.
          </p>
          <div className="flex flex-wrap gap-3">
            {sourceMode === "region" && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePickRegion();
                }}
                className="min-h-[44px] px-3 py-2 rounded-md border border-sand-200/80 text-olive/80 text-sm hover:text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/30 focus-visible:ring-offset-2"
              >
                Change region
              </button>
            )}
            <AppLink
              href="/discover"
              className="inline-flex items-center min-h-[44px] text-sm text-olive/70 hover:text-olive"
            >
              See more in Discover →
            </AppLink>
          </div>
        </div>
      </SectionShell>
    );
  }

  const loadedSubtitle =
    sourceMode === "region" && selectedRegion
      ? `Suggestions in ${getRegionShortLabel(selectedRegion)}`
      : "Suggestions near you";

  return (
    <SectionShell title={title} subtitle={loadedSubtitle}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <DistanceToggle value={distanceMode} onChange={handleDistanceChange} />
        <AppLink
          href="/discover"
          className="inline-flex items-center min-h-[44px] text-xs text-olive/70 hover:text-olive"
        >
          See more →
        </AppLink>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {items.map((item) => (
          <RightNowCard key={item.id} item={item} />
        ))}
      </div>
    </SectionShell>
  );
}
