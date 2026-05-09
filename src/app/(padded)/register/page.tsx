"use client";

import { useState, useRef, useEffect } from "react";
import AppLink from "@/components/AppLink";
import { useRouter } from "@/i18n/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthPasswordInput from "@/components/auth/AuthPasswordInput";
import AuthErrorAlert from "@/components/auth/AuthErrorAlert";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import { CTA, SECTION } from "@/lib/design-tokens";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, user, isLoading, isConfigured } = useAuth();
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user) emailRef.current?.focus();
  }, [isLoading, user]);

  if (user) {
    router.replace("/account");
    return null;
  }

  if (!isConfigured) {
    return (
      <AuthLayout
        variant="register"
        kicker={tAuth("register.configTitle")}
        title={tAuth("register.configTitle")}
        subtitle={tAuth("register.configSubtitle")}
        backHref="/account"
        backLabel={tCommon("backTo", { label: tNav("account") })}
      >
        <AppLink href="/account" className={CTA.primaryCompact}>
          {tCommon("backTo", { label: tNav("account") })}
        </AppLink>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAlreadyRegistered(false);
    if (password !== confirmPassword) {
      setError(tAuth("register.errorPasswordsDontMatch"));
      return;
    }
    if (password.length < 6) {
      setError(tAuth("register.errorPasswordTooShort"));
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await signUp(email.trim(), password, name.trim() || undefined);
      if (err) {
        const lower = err.toLowerCase();
        if (lower.includes("already") || lower.includes("already registered") || lower.includes("user already exists")) {
          setError(tAuth("register.errorEmailExists"));
          setIsAlreadyRegistered(true);
        } else if (lower.includes("password") && (lower.includes("6") || lower.includes("least"))) {
          setError(tAuth("register.errorPasswordTooShort"));
        } else if (lower.includes("invalid") && lower.includes("email")) {
          setError(tAuth("register.errorInvalidEmail"));
        } else {
          setError(tAuth("register.errorGeneric"));
        }
      } else {
        setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        variant="success"
        kicker={tAuth("register.successTitle")}
        title={tAuth("register.successTitle")}
        subtitle={
          tAuth.rich("register.successSubtitle", {
            email,
            strong: (chunks) => <strong className="text-charcoal">{chunks}</strong>,
          })
        }
        backHref="/"
        backLabel={tCommon("backTo", { label: tNav("home") })}
      >
        <AppLink href="/login" className={CTA.primaryCompact}>
          {tAuth("register.ctaSignIn")}
        </AppLink>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      variant="register"
        kicker={tAuth("register.ctaCreate")}
        title={tAuth("register.title")}
        subtitle={tAuth("register.subtitle")}
      backHref="/account"
      backLabel={tCommon("backTo", { label: tNav("account") })}
      footer={
        <>
          {tAuth("register.alreadyHavePrefix")}{" "}
          <AppLink
            href="/login"
            className="text-terracotta font-medium hover:text-terracotta-muted transition-colors"
          >
            {tAuth("register.ctaSignIn")}
          </AppLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {error && (
          <AuthErrorAlert message={error} variant={isAlreadyRegistered ? "aegean" : "terracotta"}>
            {isAlreadyRegistered && (
              <AppLink href="/login" className={SECTION.aegeanLink}>
                {tAuth("register.signInInstead")}
              </AppLink>
            )}
          </AuthErrorAlert>
        )}

        <AuthInput
          id="reg-name"
          label={tAuth("register.nameLabel")}
          type="text"
          value={name}
          onChange={setName}
          placeholder={tAuth("register.namePlaceholder")}
          disabled={loading || isLoading}
          autoComplete="name"
        />

        <AuthInput
          ref={emailRef}
          id="reg-email"
          label={tAuth("forgot.emailLabel")}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder={tAuth("forgot.emailPlaceholder")}
          disabled={loading || isLoading}
          required
          autoComplete="email"
          autoCapitalize="none"
        />

        <AuthPasswordInput
          id="reg-password"
          label={tAuth("register.passwordLabel")}
          hint={tAuth("register.passwordHint")}
          showStrength
          value={password}
          onChange={setPassword}
          disabled={loading || isLoading}
          required
          autoComplete="new-password"
        />

        <AuthPasswordInput
          id="reg-confirm"
          label={tAuth("register.confirmPasswordLabel")}
          value={confirmPassword}
          onChange={setConfirmPassword}
          disabled={loading || isLoading}
          required
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={
            loading ||
            isLoading ||
            !email.trim() ||
            !password ||
            !confirmPassword ||
            password !== confirmPassword
          }
          className={`${CTA.primaryCompact} w-full min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? tAuth("register.ctaCreating") : tAuth("register.ctaCreate")}
        </button>

        <SocialLoginButtons intent="signup" />
      </form>
    </AuthLayout>
  );
}
