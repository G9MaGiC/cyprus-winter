"use client";

import { useEffect } from "react";
import AppLink from "@/components/AppLink";
import { useRouter } from "@/i18n/navigation";
import { LAYOUT, CTA, CARD, EMPTY_STATE } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, isConfigured, signOut, needsPasswordReset } = useAuth();
  const tNav = useTranslations("nav");

  useEffect(() => {
    if (user && needsPasswordReset) router.replace("/reset-password");
  }, [user, needsPasswordReset, router]);

  if (user && needsPasswordReset) return null;

  if (isLoading) {
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <PageHeader
          title="My account"
          description="Loading…"
          breadcrumbItems={[{ label: tNav("home"), href: "/" }, { label: tNav("account"), href: "/account", isCurrent: true }]}
        />
        <div className="mt-8 h-32 rounded-xl bg-sand-100/80 animate-pulse" aria-hidden />
      </div>
    );
  }

  if (user && isConfigured) {
    const displayName = user.user_metadata?.full_name as string | undefined;
    const email = user.email ?? "";
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <PageHeader
          title="My account"
          description="Your plan and bookings, synced across devices."
          breadcrumbItems={[{ label: tNav("home"), href: "/" }, { label: tNav("account"), href: "/account", isCurrent: true }]}
        />

        <div className={`${CARD.base} ${CARD.content} mt-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {displayName && (
                <p className="font-display font-semibold text-charcoal">{displayName}</p>
              )}
              <p className="text-sm text-olive/80 break-all">{email}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className={`${CTA.chipTertiary} w-full sm:w-auto min-h-[44px] shrink-0`}
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <AppLink href="/plan" className={`${CTA.primaryCompact}`}>
            My plan
          </AppLink>
          <AppLink href="/bookings" className={`${CTA.secondaryCompact}`}>
            View my bookings
          </AppLink>
          <AppLink href="/account/settings" className={`${CTA.chipTertiary}`}>
            Settings
          </AppLink>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <PageHeader
          title="My account"
          description="Sign in (coming soon) will sync your plan and bookings across devices."
          breadcrumbItems={[{ label: tNav("home"), href: "/" }, { label: tNav("account"), href: "/account", isCurrent: true }]}
        />

        <div className={`${EMPTY_STATE} mt-12`}>
          <p className="text-olive font-semibold">Sign in coming soon</p>
          <p className="text-sm text-olive/80 mt-2 max-w-md mx-auto break-words">
            Your plan and bookings live on this device. Use the email lookup on the bookings page to pull in reservations from another device.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <AppLink href="/bookings" className={`px-6 py-3 ${CTA.primaryCompact}`}>
              View my bookings
            </AppLink>
            <AppLink href="/plan" className={`px-6 py-3 ${CTA.secondaryCompact}`}>
              My plan
            </AppLink>
            <AppLink href="/account/settings" className={`px-6 py-3 ${CTA.chipTertiary}`}>
              Settings
            </AppLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        title="My account"
        description="Sign in to sync your plan and bookings across devices."
        breadcrumbItems={[{ label: tNav("home"), href: "/" }, { label: tNav("account"), href: "/account", isCurrent: true }]}
      />

      <div className={`${EMPTY_STATE} mt-12`}>
        <p className="text-olive font-semibold">Save your plan across devices</p>
        <p className="text-sm text-olive/80 mt-2 max-w-md mx-auto break-words">
          Create a free account and your itinerary and bookings will follow you wherever you go.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
          <AppLink href="/register" className={`px-6 py-3 ${CTA.primaryCompact}`}>
            Create account
          </AppLink>
          <AppLink href="/login" className={`px-6 py-3 ${CTA.secondaryCompact}`}>
            Sign in
          </AppLink>
          <AppLink href="/plan" className="inline-flex items-center min-h-[44px] px-6 py-3 text-sm text-olive/70 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg">
            Skip — use my plan on this device
          </AppLink>
        </div>
      </div>
    </div>
  );
}
