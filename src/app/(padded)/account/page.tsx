"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LAYOUT, CTA, CARD, EMPTY_STATE } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, isConfigured, signOut, needsPasswordReset } = useAuth();

  useEffect(() => {
    if (user && needsPasswordReset) router.replace("/reset-password");
  }, [user, needsPasswordReset, router]);

  if (user && needsPasswordReset) return null;

  if (isLoading) {
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <PageHeader title="My account" description="Loading…" breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Account", href: "/account", isCurrent: true }]} />
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
          breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Account", href: "/account", isCurrent: true }]}
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
          <Link href="/plan" className={`${CTA.primaryCompact}`}>
            My plan
          </Link>
          <Link href="/bookings" className={`${CTA.secondaryCompact}`}>
            View my bookings
          </Link>
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
          breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Account", href: "/account", isCurrent: true }]}
        />

        <div className={`${EMPTY_STATE} mt-12`}>
          <p className="text-olive font-semibold">Sign in coming soon</p>
          <p className="text-sm text-olive/80 mt-2 max-w-md mx-auto break-words">
            Your plan and bookings live on this device. Use the email lookup on the bookings page to pull in reservations from another device.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/bookings" className={`px-6 py-3 ${CTA.primaryCompact}`}>
              View my bookings
            </Link>
            <Link href="/plan" className={`px-6 py-3 ${CTA.secondaryCompact}`}>
              My plan
            </Link>
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
        breadcrumbItems={[{ label: "Home", href: "/" }, { label: "Account", href: "/account", isCurrent: true }]}
      />

      <div className={`${EMPTY_STATE} mt-12`}>
        <p className="text-olive font-semibold">Save your plan across devices</p>
        <p className="text-sm text-olive/80 mt-2 max-w-md mx-auto break-words">
          Create a free account and your itinerary and bookings will follow you wherever you go.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
          <Link href="/register" className={`px-6 py-3 ${CTA.primaryCompact}`}>
            Create account
          </Link>
          <Link href="/login" className={`px-6 py-3 ${CTA.secondaryCompact}`}>
            Sign in
          </Link>
          <Link href="/plan" className="px-6 py-3 text-sm text-olive/70 hover:text-terracotta transition-colors">
            Skip — use my plan on this device
          </Link>
        </div>
      </div>
    </div>
  );
}
