"use client";

import { useState, useRef, useEffect } from "react";
import AppLink from "@/components/AppLink";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthErrorAlert from "@/components/auth/AuthErrorAlert";
import { CTA } from "@/lib/design-tokens";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const { resetPassword, isConfigured } = useAuth();
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!sent) emailRef.current?.focus();
  }, [sent]);

  if (!isConfigured) {
    return (
      <AuthLayout
        variant="forgot"
        kicker="Reset password"
        title="Reset password"
        subtitle="Auth is being set up. Contact support if you need help."
        backHref="/login"
        backLabel={tCommon("backTo", { label: tNav("signIn") })}
      >
        <AppLink href="/login" className={CTA.primaryCompact}>
          {tCommon("backTo", { label: tNav("signIn") })}
        </AppLink>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await resetPassword(email.trim());
      if (err) {
        if (err.toLowerCase().includes("valid")) {
          setError(tAuth("forgot.errorInvalidEmail"));
        } else {
          setError(tAuth("forgot.errorGeneric"));
        }
      } else {
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout
        variant="success"
        kicker={tAuth("forgot.successTitle")}
        title={tAuth("forgot.successTitle")}
        subtitle={
          tAuth.rich("forgot.successSubtitle", {
            email,
            strong: (chunks) => <strong className="text-charcoal">{chunks}</strong>,
          })
        }
        backHref="/login"
        backLabel={tCommon("backTo", { label: tNav("signIn") })}
      >
        <AppLink href="/login" className={CTA.primaryCompact}>
          {tCommon("backTo", { label: tNav("signIn") })}
        </AppLink>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      variant="forgot"
        kicker={tAuth("forgot.title")}
        title={tAuth("forgot.title")}
        subtitle={tAuth("forgot.subtitle")}
      backHref="/login"
      backLabel={tCommon("backTo", { label: tNav("signIn") })}
      footer={
        <AppLink
          href="/login"
          className="text-terracotta font-medium hover:text-terracotta-muted transition-colors"
        >
          {tCommon("backTo", { label: tNav("signIn") })}
        </AppLink>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {error && <AuthErrorAlert message={error} />}

        <AuthInput
          ref={emailRef}
          id="forgot-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          disabled={loading}
          required
          autoComplete="email"
          autoCapitalize="none"
        />

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className={`${CTA.primaryCompact} w-full min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? tAuth("forgot.ctaSending") : tAuth("forgot.ctaSend")}
        </button>
      </form>
    </AuthLayout>
  );
}
