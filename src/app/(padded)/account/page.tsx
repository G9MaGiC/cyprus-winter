"use client";

import { useEffect, useState } from "react";
import AppLink from "@/components/AppLink";
import { useRouter } from "@/i18n/navigation";
import { LAYOUT, CTA, CARD, EMPTY_STATE, TYPE } from "@/lib/design-tokens";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading, isConfigured, signOut, needsPasswordReset } = useAuth();
  const tNav = useTranslations("nav");
  const tAccount = useTranslations("account");
  const [oauthError, setOauthError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      setOauthError(params.get("error_description") || tAccount("oauthError"));
      router.replace("/account");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user && needsPasswordReset) router.replace("/reset-password");
  }, [user, needsPasswordReset, router]);

  if (user && needsPasswordReset) return null;

  if (isLoading) {
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <PageHeader
          title={tAccount("title")}
          description={tAccount("loading")}
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
          title={tAccount("title")}
          description={tAccount("signedIn.description")}
          breadcrumbItems={[{ label: tNav("home"), href: "/" }, { label: tNav("account"), href: "/account", isCurrent: true }]}
        />

        <div className={`${CARD.base} ${CARD.content} mt-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {displayName && (
                <p className={`${TYPE.cardTitle} text-charcoal`}>{displayName}</p>
              )}
              <p className="text-sm text-olive/80 break-all">{email}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              className={`${CTA.chipTertiary} w-full sm:w-auto min-h-[44px] shrink-0`}
            >
              {tAccount("signedIn.signOut")}
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <AppLink href="/plan" className={`${CTA.primaryCompact}`}>
            {tAccount("signedIn.cta.plan")}
          </AppLink>
          <AppLink href="/bookings" className={`${CTA.secondaryCompact}`}>
            {tAccount("signedIn.cta.bookings")}
          </AppLink>
          <AppLink href="/account/settings" className={`${CTA.chipTertiary}`}>
            {tAccount("signedIn.cta.settings")}
          </AppLink>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <PageHeader
          title={tAccount("title")}
          description={tAccount("notConfigured.description")}
          breadcrumbItems={[{ label: tNav("home"), href: "/" }, { label: tNav("account"), href: "/account", isCurrent: true }]}
        />

        <div className={`${EMPTY_STATE} mt-12`}>
          <p className="text-olive font-semibold">
            {tAccount("notConfigured.title")}
          </p>
          <p className="text-sm text-olive/80 mt-2 max-w-md mx-auto break-words">
            {tAccount("notConfigured.body")}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <AppLink href="/bookings" className={`px-6 py-3 ${CTA.primaryCompact}`}>
              {tAccount("signedIn.cta.bookings")}
            </AppLink>
            <AppLink href="/plan" className={`px-6 py-3 ${CTA.secondaryCompact}`}>
              {tAccount("signedIn.cta.plan")}
            </AppLink>
            <AppLink href="/account/settings" className={`px-6 py-3 ${CTA.chipTertiary}`}>
              {tAccount("signedIn.cta.settings")}
            </AppLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${LAYOUT.form} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
      <PageHeader
        title={tAccount("title")}
        description={tAccount("signedOut.description")}
        breadcrumbItems={[{ label: tNav("home"), href: "/" }, { label: tNav("account"), href: "/account", isCurrent: true }]}
      />

      {oauthError && (
        <div role="alert" className="mt-6 rounded-lg border border-terracotta/30 bg-terracotta/5 p-4 text-sm text-terracotta">
          {oauthError}
        </div>
      )}

      <div className={`${EMPTY_STATE} mt-12`}>
        <p className="text-olive font-semibold">
          {tAccount("signedOut.title")}
        </p>
        <p className="text-sm text-olive/80 mt-2 max-w-md mx-auto break-words">
          {tAccount("signedOut.body")}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
          <AppLink href="/register" className={`px-6 py-3 ${CTA.primaryCompact}`}>
            {tAccount("signedOut.cta.create")}
          </AppLink>
          <AppLink href="/login" className={`px-6 py-3 ${CTA.secondaryCompact}`}>
            {tAccount("signedOut.cta.signIn")}
          </AppLink>
          <AppLink href="/plan" className="inline-flex items-center min-h-[44px] px-6 py-3 text-sm text-olive/70 hover:text-terracotta transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg">
            {tAccount("signedOut.cta.skip")}
          </AppLink>
        </div>
      </div>
    </div>
  );
}
