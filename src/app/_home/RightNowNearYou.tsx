"use client";

import { LAYOUT, SECTION, TYPE } from "@/lib/design-tokens";
import RightNowCard from "@/components/RightNowCard";
import AppLink from "@/components/AppLink";
import AIAssistantTrigger from "@/components/AIAssistantTrigger";
import LocationActionButtons from "@/components/LocationActionButtons";
import RegionPickerChips from "@/components/RegionPickerChips";
import { TrackOnClick } from "@/components/TrackOnClick";
import { getRegionShortLabel, type RegionSlug } from "@/data/regions";
import { useRightNowFeed } from "@/hooks/useRightNowFeed";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useTranslations } from "next-intl";
import { RateLimitError, NetworkError } from "@/components/ui/ErrorState";

type DistanceMode = "less" | "more";

function SectionShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <section
      id="right-now"
      aria-labelledby="right-now-heading"
      className={`${SECTION.pySub} ${SECTION.alt} ${LAYOUT.safeAreaX}`}
    >
      <div className={`${LAYOUT.list} mx-auto`}>
        <header className={SECTION.headingGap}>
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
  const tHome = useTranslations("home");
  return (
    <div
      role="group"
      aria-label={tHome("rightNow.distance.aria")}
      className="inline-flex rounded-lg border border-sand-200/80 bg-white/80 p-0.5 gap-px"
    >
      <button
        type="button"
        aria-pressed={value === "less"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange("less");
        }}
        className={`min-h-[44px] px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          value === "less"
            ? "bg-white text-olive shadow-sm"
            : "text-olive/70 hover:text-olive"
        }`}
      >
        {tHome("rightNow.distance.closer")}
      </button>
      <button
        type="button"
        aria-pressed={value === "more"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange("more");
        }}
        className={`min-h-[44px] px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          value === "more"
            ? "bg-white text-olive shadow-sm"
            : "text-olive/70 hover:text-olive"
        }`}
      >
        {tHome("rightNow.distance.farther")}
      </button>
    </div>
  );
}

type RightNowNearYouProps = { title?: string };

export default function RightNowNearYou({ title }: RightNowNearYouProps) {
  const tHome = useTranslations("home");
  const sectionTitle = title ?? tHome("rightNowNearYou");
  const tErrors = useTranslations("errors");
  const {
    state,
    items,
    lastErrorCode,
    lastRetryAfterSeconds,
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
      <SectionShell title={sectionTitle} subtitle={tHome("rightNow.subtitleConsent")}>
          <div className="rounded-xl border border-sand-200/70 p-5 sm:p-6 bg-white/90 shadow-sm">
          <p className={`text-olive/80 text-sm ${SECTION.headingGap}`}>
            {tHome("rightNow.consent.body")}
          </p>
          <LocationActionButtons
            primaryLabel={tHome("rightNow.consent.cta.useLocation")}
            onPrimary={handleUseLocation}
            onSecondary={handlePickRegion}
            secondaryLabel={tHome("rightNow.consent.cta.pickRegion")}
            className="mt-0"
          />
        </div>
      </SectionShell>
    );
  }

  if (state === "region-picker") {
    return (
      <SectionShell title={sectionTitle}>
          <div className="rounded-xl border border-sand-200/70 p-5 sm:p-6 bg-white/90 shadow-sm">
          <p className={`text-olive/80 text-sm ${SECTION.headingGap}`}>
            {tHome("rightNow.regionPicker.body")}
          </p>
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
      <SectionShell title={sectionTitle}>
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
    return (
      <SectionShell title={sectionTitle}>
        <div className="rounded-xl border border-sand-200/70 p-5 sm:p-6 bg-white/90 shadow-sm">
          {state === "denied" ? (
            <p className={`text-olive/80 text-sm ${SECTION.headingGap}`}>
              {tErrors("rightNow.locationDenied")}
            </p>
          ) : lastErrorCode === "RATE_LIMITED" ? (
            <RateLimitError
              retryAfter={lastRetryAfterSeconds}
              onRetry={handleUseLocation}
              className="bg-transparent border-0 shadow-none p-0"
            />
          ) : (
            <NetworkError
              onRetry={handleUseLocation}
              className="bg-transparent border-0 shadow-none p-0"
            />
          )}
          <LocationActionButtons
            primaryLabel={tErrors("common.tryAgainCta")}
            onPrimary={handleUseLocation}
            onSecondary={handlePickRegion}
            secondaryLabel={tHome("rightNow.consent.cta.pickRegion")}
            className="mt-0"
          />
        </div>
      </SectionShell>
    );
  }

  if (state === "empty") {
    const subtitle =
      sourceMode === "region" && selectedRegion
        ? tHome("rightNow.subtitleRegion", {
            region: getRegionShortLabel(selectedRegion),
          })
        : undefined;
    return (
      <SectionShell title={sectionTitle} subtitle={subtitle}>
          <div className="rounded-xl border border-sand-200/70 p-5 sm:p-6 bg-white/90 shadow-sm">
          <p className={`text-olive/80 text-sm ${SECTION.headingGap}`}>
            {tHome("rightNow.empty.body", {
              scope: sourceMode === "region" ? tHome("rightNow.empty.scopeRegion") : tHome("rightNow.empty.scopeNow"),
            })}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {sourceMode === "region" && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePickRegion();
                }}
                className="min-h-[44px] px-3 py-2 rounded-md border border-sand-200/80 text-olive/80 text-sm hover:text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {tHome("rightNow.empty.changeRegion")}
              </button>
            )}
            <AppLink href="/discover" className={SECTION.aegeanLink}>
              {tHome("rightNow.empty.seeMoreDiscover")}
            </AppLink>
            <AIAssistantTrigger label={tHome("rightNow.empty.askAI")} />
          </div>
        </div>
      </SectionShell>
    );
  }

  const loadedSubtitle =
    sourceMode === "region" && selectedRegion
      ? tHome("rightNow.subtitleLoadedRegion", {
          region: getRegionShortLabel(selectedRegion),
        })
      : tHome("rightNow.subtitleLoadedLocation");

  return (
    <SectionShell title={sectionTitle} subtitle={loadedSubtitle}>
      <div className={`flex flex-wrap items-center justify-between gap-2 ${SECTION.headingGap}`}>
        <DistanceToggle value={distanceMode} onChange={handleDistanceChange} />
        <AppLink href="/discover" className={SECTION.aegeanLink}>
          {tHome("rightNow.loaded.seeMore")}
        </AppLink>
      </div>
      <div className={`${SECTION.headingGap} rounded-xl border border-aegean/20 bg-aegean/5 p-4`}>
        <p className={`${TYPE.kicker} text-aegean`}>
          {tHome("rightNow.adapt.kicker")}
        </p>
        <p className="mt-1 text-sm text-olive/80">
          {tHome("rightNow.adapt.body")}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <TrackOnClick event="today_adapt_action_click" properties={{ action: "weather" }}>
            <AppLink href="/weather" className={SECTION.aegeanLink}>
              {tHome("rightNow.adapt.ctaWeather")}
            </AppLink>
          </TrackOnClick>
          <TrackOnClick event="today_adapt_action_click" properties={{ action: "plan" }}>
            <AppLink href="/plan" className={SECTION.aegeanLink}>
              {tHome("rightNow.adapt.ctaPlan")}
            </AppLink>
          </TrackOnClick>
          <TrackOnClick event="today_adapt_action_click" properties={{ action: "bookings" }}>
            <AppLink href="/bookings" className={SECTION.aegeanLink}>
              {tHome("rightNow.adapt.ctaBookings")}
            </AppLink>
          </TrackOnClick>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {items.map((item) => (
          <RightNowCard key={item.id} item={item} />
        ))}
      </div>
    </SectionShell>
  );
}
