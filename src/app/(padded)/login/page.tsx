"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthPasswordInput from "@/components/auth/AuthPasswordInput";
import AuthErrorAlert from "@/components/auth/AuthErrorAlert";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import { CTA } from "@/lib/design-tokens";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";

function isSafeInternalRedirect(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("\\")) return false;
  if (path.length > 2048) return false;
  return true;
}

function formatLoginError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("invalid") || lower.includes("credentials")) {
    return "Email or password doesn't match. Try again or use magic link.";
  }
  if (lower.includes("email not confirmed") || lower.includes("confirm")) {
    return "Please confirm your email first. Check your inbox for the activation link.";
  }
  return raw || "Something went wrong. Try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") ?? "/account";
  const redirect = isSafeInternalRedirect(rawRedirect) ? rawRedirect : "/account";
  const { signIn, signInWithOtp, user, isLoading, isConfigured } = useAuth();
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !user && !magicSent) emailRef.current?.focus();
  }, [isLoading, user, magicSent]);

  if (user) {
    router.replace(redirect);
    return null;
  }

  if (!isConfigured) {
    return (
      <AuthLayout
        variant="login"
        kicker="Sign in"
        title="Sign in"
        subtitle="Auth is being set up. For now, use the email lookup on the bookings page to load reservations from another device."
        backHref="/account"
        backLabel={tCommon("backTo", { label: tNav("account") })}
      >
        <Link href="/account" className={`${CTA.primaryCompact} inline-block`}>
          {tCommon("backTo", { label: tNav("account") })}
        </Link>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "magic") {
        const { error: err } = await signInWithOtp(email.trim());
        if (err) setError(formatLoginError(err));
        else setMagicSent(true);
      } else {
        const { error: err } = await signIn(email.trim(), password);
        if (err) setError(formatLoginError(err));
        else router.replace(redirect);
      }
    } finally {
      setLoading(false);
    }
  };

  if (magicSent) {
    return (
      <AuthLayout
        variant="success"
        kicker="Check your email"
        title="Link sent"
        subtitle={
          <>
            We sent a sign-in link to <strong className="text-charcoal">{email}</strong>. Click it to sign in.
          </>
        }
        backHref="/account"
        backLabel={tCommon("backTo", { label: tNav("account") })}
      >
        <button
          type="button"
          onClick={() => {
            setMagicSent(false);
            setError(null);
          }}
          className={CTA.secondaryCompact}
        >
          Use a different method
        </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      variant="login"
      kicker="Sign in"
      title="Welcome back"
      subtitle="Your plan and bookings follow you. Trails, villages, wineries — all in one place."
      backHref="/account"
      backLabel={tCommon("backTo", { label: tNav("account") })}
      footer={
        <>
          No account?{" "}
          <Link
            href="/register"
            className="text-terracotta font-medium hover:text-terracotta-muted transition-colors"
          >
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {error && <AuthErrorAlert message={error} />}

        <AuthInput
          ref={emailRef}
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          disabled={loading || isLoading}
          required
          autoComplete="email"
          autoCapitalize="none"
        />

        {mode === "password" && (
          <AuthPasswordInput
            id="login-password"
            label="Password"
            labelAside={
              <Link
                href="/forgot-password"
                className="text-sm text-terracotta hover:text-terracotta-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded"
              >
                Forgot password?
              </Link>
            }
            value={password}
            onChange={setPassword}
            disabled={loading || isLoading}
            required
            autoComplete="current-password"
          />
        )}

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || isLoading || !email.trim()}
            className={`${CTA.primaryCompact} w-full min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Signing in…" : mode === "password" ? "Sign in" : "Send magic link"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "password" ? "magic" : "password");
              setError(null);
            }}
            className={`${CTA.chipTertiary} w-full min-h-[44px]`}
          >
            {mode === "password" ? "Use magic link" : "Use password"}
          </button>

          <SocialLoginButtons redirectPath={redirect} intent="signin" />
        </div>
      </form>
    </AuthLayout>
  );
}
