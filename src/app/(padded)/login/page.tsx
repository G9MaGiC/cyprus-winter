"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BackLink from "@/components/BackLink";
import { LAYOUT, CARD, CTA } from "@/lib/design-tokens";
import { useAuth } from "@/contexts/AuthContext";

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
  const redirect = searchParams.get("redirect") ?? "/account";
  const { signIn, signInWithOtp, user, isLoading, isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="min-h-[60vh] bg-gradient-to-b from-sand-100/60 to-background">
        <div className={`${LAYOUT.formNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
          <BackLink href="/account" label="Back to account" />
          <div className={`${CARD.base} ${CARD.contentLg} mt-10 border-l-4 border-l-terracotta/50`}>
            <h1 className="font-display text-xl font-semibold text-charcoal mb-2">Sign in</h1>
            <p className="text-olive/80 text-sm leading-relaxed mb-6">
              Auth is being set up. For now, use the email lookup on the bookings page to load reservations from another device.
            </p>
            <Link href="/account" className={`${CTA.primaryCompact} inline-block`}>
              Back to account
            </Link>
          </div>
        </div>
      </div>
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
      <div className="min-h-[60vh] bg-gradient-to-b from-sand-100/60 to-background">
        <div className={`${LAYOUT.formNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
          <BackLink href="/account" label="Back to account" />
          <div className={`${CARD.base} ${CARD.contentLg} mt-10 border-l-4 border-l-aegean/50`}>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-aegean mb-2">
              Check your email
            </p>
            <h1 className="font-display text-2xl font-bold text-charcoal mb-2">Link sent</h1>
            <p className="text-olive/80 text-base leading-relaxed mb-6">
              We sent a sign-in link to <strong className="text-charcoal">{email}</strong>. Click it to sign in.
            </p>
            <button
              type="button"
              onClick={() => { setMagicSent(false); setError(null); }}
              className={CTA.secondaryCompact}
            >
              Use a different method
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputBase =
    "w-full min-h-[48px] px-4 py-3 rounded-xl border border-sand-200/90 bg-white/95 text-charcoal placeholder:text-olive/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta/50 transition-colors";

  return (
    <div className="min-h-[60vh] bg-gradient-to-b from-sand-100/60 to-background">
      <div className={`${LAYOUT.formNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
        <BackLink href="/account" label="Back to account" />

        <div className={`${CARD.base} ${CARD.contentLg} mt-10 sm:mt-14 border-l-4 border-l-terracotta/50 shadow-md`}>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-terracotta/90 mb-2">
            Sign in
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal mb-2">
            Welcome back
          </h1>
          <p className="text-olive/80 text-base leading-relaxed mb-8">
            Your plan and bookings follow you across devices.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {error && (
              <div role="alert" className="p-4 rounded-xl bg-terracotta/5 border border-terracotta/20 text-sm text-olive">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-olive mb-2">
                Email
              </label>
              <input
                ref={emailRef}
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputBase}
                placeholder="you@example.com"
                disabled={loading || isLoading}
                autoCapitalize="none"
              />
            </div>

            {mode === "password" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="login-password" className="block text-sm font-medium text-olive">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-terracotta hover:text-terracotta-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 rounded"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className={`${inputBase} pr-12`}
                    placeholder="••••••••"
                    disabled={loading || isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-olive/60 hover:text-olive transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>
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
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-olive/70">
          No account?{" "}
          <Link href="/register" className="text-terracotta font-medium hover:text-terracotta-muted transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
