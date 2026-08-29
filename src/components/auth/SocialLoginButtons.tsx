"use client";

import React, { useState } from "react";
import { useAuth, type OAuthProvider } from "@/contexts/AuthContext";
import { useLocale, useTranslations } from "next-intl";
import { localizedPathname } from "@/lib/seo-locale-urls";

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";
const APPLE_ENABLED = process.env.NEXT_PUBLIC_AUTH_APPLE_ENABLED === "true";

const buttonBase =
  "inline-flex items-center justify-center gap-2.5 min-h-[48px] w-full px-4 py-3 rounded-xl border-2 border-sand-200/90 bg-white/95 text-charcoal font-medium hover:border-terracotta/30 hover:bg-terracotta/5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

type SocialLoginButtonsProps = {
  /** Full redirect URL (built client-side to avoid hydration mismatch) or path like "/account" */
  redirectTo?: string;
  /** Path to redirect after OAuth (e.g. "/account"); used when redirectTo not provided */
  redirectPath?: string;
  intent?: "signin" | "signup";
};

export default function SocialLoginButtons({
  redirectTo,
  redirectPath = "/account",
  intent = "signin",
}: SocialLoginButtonsProps) {
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const { signInWithOAuth } = useAuth();
  const [loading, setLoading] = useState<OAuthProvider | null>(null);

  const providers: { id: OAuthProvider; enabled: boolean; label: string; Icon: () => React.ReactNode }[] = [
    { id: "google", enabled: GOOGLE_ENABLED, label: tAuth("social.providers.google"), Icon: GoogleIcon },
    { id: "apple", enabled: APPLE_ENABLED, label: tAuth("social.providers.apple"), Icon: AppleIcon },
  ];

  const enabledProviders = providers.filter((p) => p.enabled);
  if (enabledProviders.length === 0) return null;

  const handleClick = async (provider: OAuthProvider) => {
    setLoading(provider);
    try {
      const path = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
      const to =
        redirectTo ??
        (typeof window !== "undefined"
          ? `${window.location.origin}${localizedPathname(path, locale)}`
          : undefined);
      await signInWithOAuth(provider, to);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-sand-200/80" />
        </div>
        <p className="relative flex justify-center text-sm">
          <span className="bg-white/95 px-4 text-olive/70">{tAuth("social.orContinueWith")}</span>
        </p>
      </div>
      <div
        className={`grid gap-3 ${enabledProviders.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
      >
        {enabledProviders.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleClick(id)}
            disabled={!!loading}
            className={buttonBase}
            aria-label={tAuth("social.aria", { intent, provider: label })}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
