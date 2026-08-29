"use client";

import { useState, useEffect } from "react";
import AppLink from "@/components/AppLink";
import { useRouter } from "@/i18n/navigation";
import BackLink from "@/components/BackLink";
import { LAYOUT, CARD, CTA, TYPE } from "@/lib/design-tokens";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { user, needsPasswordReset, updatePassword, isConfigured, isLoading } = useAuth();
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && !needsPasswordReset && !success) {
      router.replace("/account");
    }
  }, [user, needsPasswordReset, success, router]);

  if (!isConfigured) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-sand-100/60 to-background">
        <div className={`${LAYOUT.formNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
          <BackLink href="/login" label={tCommon("backTo", { label: tNav("signIn") })} />
          <div className={`${CARD.base} ${CARD.contentLg} mt-10 border-s-4 border-s-terracotta/50`}>
            <h1 className={`${TYPE.subSectionTitle} text-charcoal mb-2`}>
              {tAuth("reset.configTitle")}
            </h1>
            <p className="text-muted-ink text-sm leading-relaxed mb-6">
              {tAuth("reset.configSubtitle")}
            </p>
            <AppLink href="/login" className={CTA.primaryCompact}>
              {tCommon("backTo", { label: tNav("signIn") })}
            </AppLink>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(tAuth("reset.errorPasswordsDontMatch"));
      return;
    }
    if (password.length < 6) {
      setError(tAuth("reset.errorPasswordTooShort"));
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await updatePassword(password);
      if (err) {
        setError(tAuth("reset.errorGeneric"));
      } else {
        setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-sand-100/60 to-background">
        <div className={`${LAYOUT.formNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
          <BackLink href="/account" label={tCommon("backTo", { label: tNav("account") })} />
          <div className={`${CARD.base} ${CARD.contentLg} mt-10 border-s-4 border-s-aegean/50`}>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-aegean mb-2">
              {tCommon("done")}
            </p>
            <h1 className={`${TYPE.sectionTitle} text-charcoal mb-2`}>
              {tAuth("reset.successTitle")}
            </h1>
            <p className="text-muted-ink text-base leading-relaxed mb-6">
              {tAuth("reset.successSubtitle")}
            </p>
            <AppLink href="/account" className={CTA.primaryCompact}>
              {tCommon("backTo", { label: tNav("account") })}
            </AppLink>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-sand-100/60 to-background">
        <div className={`${LAYOUT.formNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
          <BackLink href="/login" label={tCommon("backTo", { label: tNav("signIn") })} />
          <div className="mt-10 h-48 rounded-xl bg-sand-100/80 animate-pulse" aria-hidden />
        </div>
      </div>
    );
  }

  if (!needsPasswordReset && !user) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-sand-100/60 to-background">
        <div className={`${LAYOUT.formNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
          <BackLink href="/login" label={tCommon("backTo", { label: tNav("signIn") })} />
          <div className={`${CARD.base} ${CARD.contentLg} mt-10 border-s-4 border-s-terracotta/50`}>
            <h1 className={`${TYPE.subSectionTitle} text-charcoal mb-2`}>
              {tAuth("reset.invalidLinkTitle")}
            </h1>
            <p className="text-muted-ink text-sm leading-relaxed mb-6">
              {tAuth("reset.invalidLinkSubtitle")}
            </p>
            <AppLink href="/forgot-password" className={CTA.primaryCompact}>
              {tCommon("backTo", { label: tNav("signIn") })}
            </AppLink>
          </div>
        </div>
      </div>
    );
  }

  const inputBase =
    "w-full min-h-[48px] px-4 py-3 rounded-xl border border-sand-200/90 bg-white/95 text-charcoal placeholder:text-muted-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 focus-visible:border-terracotta/50 transition-colors";

  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-sand-100/60 to-background">
      <div className={`${LAYOUT.formNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <BackLink href="/login" label={tCommon("backTo", { label: tNav("signIn") })} />

        <div className={`${CARD.base} ${CARD.contentLg} mt-10 sm:mt-14 border-s-4 border-s-terracotta/50 shadow-md`}>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-terracotta mb-2">
            {tAuth("reset.kicker")}
          </p>
          <h1 className={`${TYPE.sectionTitle} font-bold text-charcoal mb-2`}>
            {tAuth("reset.title")}
          </h1>
          <p className="text-muted-ink text-base leading-relaxed mb-8">
            {tAuth("reset.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {error && (
              <div role="alert" className="p-4 rounded-xl bg-terracotta/5 border border-terracotta/20 text-sm text-olive">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="reset-password" className="block text-sm font-medium text-olive mb-2">
                {tAuth("reset.newPasswordLabel")}
              </label>
              <p id="reset-password-hint" className="text-xs text-muted-ink mb-1.5">
                {tAuth("reset.inlinePasswordHint")}
              </p>
              <div className="relative">
                <input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className={`${inputBase} pe-12`}
                  placeholder={tAuth("reset.passwordPlaceholder")}
                  disabled={loading}
                  aria-describedby="reset-password-hint"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute end-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-ink hover:text-olive transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40"
                  aria-label={showPassword ? tAuth("reset.ariaHidePassword") : tAuth("reset.ariaShowPassword")}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reset-confirm" className="block text-sm font-medium text-olive mb-2">
                {tAuth("reset.confirmPasswordLabel")}
              </label>
              <input
                id="reset-confirm"
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className={inputBase}
                placeholder={tAuth("reset.passwordPlaceholder")}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirm || password !== confirm}
              className={`${CTA.primaryCompact} w-full min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? tAuth("reset.ctaUpdating") : tAuth("reset.ctaUpdate")}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-muted-ink">
          <AppLink href="/login" className="text-terracotta font-medium hover:text-terracotta-muted transition-colors">
            {tCommon("backTo", { label: tNav("signIn") })}
          </AppLink>
        </p>
      </div>
    </div>
  );
}
