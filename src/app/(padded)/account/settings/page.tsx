"use client";

import { useState } from "react";
import { LAYOUT, CTA, CARD, SECTION } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Link } from "@/i18n/navigation";
import {
  INTEREST_LABELS,
  TRAVELER_LABELS,
  type Interest,
  type TravelerType,
} from "@/lib/user-preferences";
import { REGION_CONFIGS, getRegionShortLabel } from "@/data/regions";
import { clearRecentlyViewed } from "@/lib/recently-viewed";
import { useTranslations } from "next-intl";

const chipBase =
  "inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const chipInactive = "bg-sand-200/80 text-olive/80 hover:bg-terracotta/10 hover:text-terracotta";
const chipActive = "bg-terracotta text-white border border-terracotta/30 shadow-sm";

export default function AccountSettingsPage() {
  const { prefs, update, toggleInterest, toggleFavoriteRegion, hydrated } = useUserPreferences();
  const [cleared, setCleared] = useState(false);
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");

  const handleClearRecentlyViewed = () => {
    clearRecentlyViewed();
    setCleared(true);
  };

  if (!hydrated) {
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <PageHeader
          title="Settings"
          description="Loading…"
          backHref="/account"
          backLabel={tNav("account")}
          breadcrumbItems={[
            { label: tNav("home"), href: "/" },
            { label: tNav("account"), href: "/account" },
            { label: tCommon("breadcrumbs.settings"), href: "/account/settings", isCurrent: true },
          ]}
        />
        <div className="mt-8 h-32 rounded-xl bg-sand-100/80 animate-pulse" aria-hidden />
      </div>
    );
  }

  return (
    <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        title="Settings"
        description="Personalize your experience. We use these to surface places and trails that match your style."
        backHref="/account"
        backLabel={tNav("account")}
        breadcrumbItems={[
          { label: tNav("home"), href: "/" },
          { label: tNav("account"), href: "/account" },
          { label: tCommon("breadcrumbs.settings"), href: "/account/settings", isCurrent: true },
        ]}
      />

      {/* Interests */}
      <section className={`mt-10 ${SECTION.blockGap}`}>
        <h2 className={`${SECTION.headingGap} font-display text-xl font-semibold text-charcoal`}>
          Interests
        </h2>
        <p className="text-sm text-olive/80 mb-4">
          Pick what excites you. Discover, Right Now, and plan suggestions will lean toward these.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {(Object.keys(INTEREST_LABELS) as Interest[]).map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`${chipBase} ${prefs.interests.includes(interest) ? chipActive : chipInactive}`}
            >
              {INTEREST_LABELS[interest]}
            </button>
          ))}
        </div>
      </section>

      {/* Traveler type */}
      <section className="mt-10">
        <h2 className={`${SECTION.headingGap} font-display text-xl font-semibold text-charcoal`}>
          Travel style
        </h2>
        <p className="text-sm text-olive/80 mb-4">
          Helps tailor suggestions (e.g. family-friendly spots, couples retreats).
        </p>
        <div className="flex flex-wrap gap-2.5">
          {(Object.keys(TRAVELER_LABELS) as TravelerType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update({ travelerType: prefs.travelerType === type ? null : type })}
              className={`${chipBase} ${prefs.travelerType === type ? chipActive : chipInactive}`}
            >
              {TRAVELER_LABELS[type]}
            </button>
          ))}
        </div>
      </section>

      {/* Favorite regions */}
      <section className="mt-10">
        <h2 className={`${SECTION.headingGap} font-display text-xl font-semibold text-charcoal`}>
          Favorite regions
        </h2>
        <p className="text-sm text-olive/80 mb-4">
          We&apos;ll boost content from these areas in Discover and Right Now.
        </p>
        <div className="flex flex-wrap gap-2.5">
          {REGION_CONFIGS.map((r) => (
            <button
              key={r.slug}
              type="button"
              onClick={() => toggleFavoriteRegion(r.slug)}
              className={`${chipBase} ${prefs.favoriteRegions.includes(r.slug) ? chipActive : chipInactive}`}
            >
              {getRegionShortLabel(r.slug)}
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className={`${CARD.base} ${CARD.content} mt-10`}>
        <h2 className={`${SECTION.headingGap} font-display text-xl font-semibold text-charcoal`}>
          Notifications
        </h2>
        <p className="text-sm text-olive/80 mb-4">
          If you enable push, we&apos;ll use these preferences for alerts.
        </p>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.notifyTrailConditions}
              onChange={(e) => update({ notifyTrailConditions: e.target.checked })}
              className="h-5 w-5 rounded border-sand-300 text-terracotta focus-visible:ring-terracotta/50"
            />
            <span className="text-olive">Trail condition updates (Troodos, etc.)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.notifyEvents}
              onChange={(e) => update({ notifyEvents: e.target.checked })}
              className="h-5 w-5 rounded border-sand-300 text-terracotta focus-visible:ring-terracotta/50"
            />
            <span className="text-olive">Winter events and festivals</span>
          </label>
        </div>
      </section>

      {/* Data & privacy */}
      <section className={`${CARD.base} ${CARD.content} mt-8`}>
        <h2 className={`${SECTION.headingGap} font-display text-xl font-semibold text-charcoal`}>
          Data & privacy
        </h2>
        <p className="text-sm text-olive/80 mb-4">
          Control what we keep on this device. For data we hold (bookings, trail reports), you can request export or deletion.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleClearRecentlyViewed}
            className={`${CTA.chipTertiary}`}
          >
            {cleared ? "Recently viewed cleared" : "Clear recently viewed"}
          </button>
          <a
            href="mailto:privacy@cypruswinter.com?subject=Data%20export%20request"
            className={`${CTA.chipTertiary}`}
          >
            Request data export
          </a>
          <a
            href="mailto:privacy@cypruswinter.com?subject=Data%20deletion%20request"
            className={`${CTA.chipTertiary}`}
          >
            Request deletion
          </a>
        </div>
        <p className="text-xs text-olive/60 mt-3">
          Include the email used for bookings or trail reports. We respond within 30 days. See our{" "}
          <Link href="/privacy" className="text-terracotta hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <div className="mt-10 flex justify-start">
        <Link href="/account" className={`${CTA.secondaryCompact}`}>
          ← Back to account
        </Link>
      </div>
    </div>
  );
}
