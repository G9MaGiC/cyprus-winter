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
  const tSettings = useTranslations("account.settings");

  const handleClearRecentlyViewed = () => {
    clearRecentlyViewed();
    setCleared(true);
  };

  if (!hydrated) {
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <PageHeader
          title={tSettings("title")}
          description={tSettings("loading")}
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
        title={tSettings("title")}
        description={tSettings("description")}
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
          {tSettings("interests.title")}
        </h2>
        <p className="text-sm text-olive/80 mb-4">
          {tSettings("interests.body")}
        </p>
        <div className="flex flex-wrap gap-2.5">
          {(Object.keys(INTEREST_LABELS) as Interest[]).map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`${chipBase} ${prefs.interests.includes(interest) ? chipActive : chipInactive}`}
            >
              {tSettings(`interests.labels.${interest}`)}
            </button>
          ))}
        </div>
      </section>

      {/* Traveler type */}
      <section className="mt-10">
        <h2 className={`${SECTION.headingGap} font-display text-xl font-semibold text-charcoal`}>
          {tSettings("travelStyle.title")}
        </h2>
        <p className="text-sm text-olive/80 mb-4">
          {tSettings("travelStyle.body")}
        </p>
        <div className="flex flex-wrap gap-2.5">
          {(Object.keys(TRAVELER_LABELS) as TravelerType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update({ travelerType: prefs.travelerType === type ? null : type })}
              className={`${chipBase} ${prefs.travelerType === type ? chipActive : chipInactive}`}
            >
              {tSettings(`travelStyle.labels.${type}`)}
            </button>
          ))}
        </div>
      </section>

      {/* Favorite regions */}
      <section className="mt-10">
        <h2 className={`${SECTION.headingGap} font-display text-xl font-semibold text-charcoal`}>
          {tSettings("regions.title")}
        </h2>
        <p className="text-sm text-olive/80 mb-4">
          {tSettings("regions.body")}
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
          {tSettings("notifications.title")}
        </h2>
        <p className="text-sm text-olive/80 mb-4">
          {tSettings("notifications.body")}
        </p>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.notifyTrailConditions}
              onChange={(e) => update({ notifyTrailConditions: e.target.checked })}
              className="h-5 w-5 rounded border-sand-300 text-terracotta focus-visible:ring-terracotta/50"
            />
            <span className="text-olive">
              {tSettings("notifications.trails")}
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.notifyEvents}
              onChange={(e) => update({ notifyEvents: e.target.checked })}
              className="h-5 w-5 rounded border-sand-300 text-terracotta focus-visible:ring-terracotta/50"
            />
            <span className="text-olive">
              {tSettings("notifications.events")}
            </span>
          </label>
        </div>
      </section>

      {/* Data & privacy */}
      <section className={`${CARD.base} ${CARD.content} mt-8`}>
        <h2 className={`${SECTION.headingGap} font-display text-xl font-semibold text-charcoal`}>
          {tSettings("privacy.title")}
        </h2>
        <p className="text-sm text-olive/80 mb-4">
          {tSettings("privacy.body")}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleClearRecentlyViewed}
            className={`${CTA.chipTertiary}`}
          >
            {cleared ? tSettings("privacy.cleared") : tSettings("privacy.clear")}
          </button>
          <a
            href="mailto:privacy@cypruswinter.com?subject=Data%20export%20request"
            className={`${CTA.chipTertiary}`}
          >
            {tSettings("privacy.requestExport")}
          </a>
          <a
            href="mailto:privacy@cypruswinter.com?subject=Data%20deletion%20request"
            className={`${CTA.chipTertiary}`}
          >
            {tSettings("privacy.requestDeletion")}
          </a>
        </div>
        <p className="text-xs text-olive/60 mt-3">
          {tSettings("privacy.footer.prefix")}{" "}
          <Link href="/privacy" className="text-terracotta hover:underline">
            {tSettings("privacy.footer.privacyPolicy")}
          </Link>
          {tSettings("privacy.footer.suffix")}
        </p>
      </section>

      <div className="mt-10 flex justify-start">
        <Link href="/account" className={`${CTA.secondaryCompact}`}>
          {tSettings("backToAccount")}
        </Link>
      </div>
    </div>
  );
}
