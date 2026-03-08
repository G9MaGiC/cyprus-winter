"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BackLink from "@/components/BackLink";
import { LAYOUT, CARD, CTA } from "@/lib/design-tokens";
import { useAuth } from "@/contexts/AuthContext";

function formatSignUpError(raw: string): { message: string; isAlreadyRegistered: boolean } {
  const lower = raw.toLowerCase();
  if (lower.includes("already") || lower.includes("already registered") || lower.includes("user already exists")) {
    return { message: "An account with that email already exists.", isAlreadyRegistered: true };
  }
  if (lower.includes("password") && (lower.includes("6") || lower.includes("least"))) {
    return { message: "Password must be at least 6 characters.", isAlreadyRegistered: false };
  }
  if (lower.includes("invalid") && lower.includes("email")) {
    return { message: "Please enter a valid email address.", isAlreadyRegistered: false };
  }
  return { message: raw || "Something went wrong. Try again.", isAlreadyRegistered: false };
}

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, user, isLoading, isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="min-h-[60vh] bg-gradient-to-b from-sand-100/60 to-background">
        <div className={`${LAYOUT.formNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
          <BackLink href="/account" label="Back to account" />
          <div className={`${CARD.base} ${CARD.contentLg} mt-10 border-l-4 border-l-terracotta/50`}>
            <h1 className="font-display text-xl font-semibold text-charcoal mb-2">Create account</h1>
            <p className="text-olive/80 text-sm leading-relaxed mb-6">
              Auth is being set up. You can still use the app—your plan saves on this device. Check back soon.
            </p>
            <Link href="/account" className={CTA.primaryCompact}>
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
    setIsAlreadyRegistered(false);
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await signUp(email.trim(), password, name.trim() || undefined);
      if (err) {
        const { message, isAlreadyRegistered: already } = formatSignUpError(err);
        setError(message);
        setIsAlreadyRegistered(already);
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
          <BackLink href="/" label="Back to home" />
          <div className={`${CARD.base} ${CARD.contentLg} mt-10 border-l-4 border-l-aegean/50`}>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-aegean mb-2">
              Check your email
            </p>
            <h1 className="font-display text-2xl font-bold text-charcoal mb-2">Almost there</h1>
            <p className="text-olive/80 text-base leading-relaxed mb-6">
              We sent a confirmation link to <strong className="text-charcoal">{email}</strong>. Click it to activate your account, then sign in.
            </p>
            <Link href="/login" className={CTA.primaryCompact}>
              Sign in
            </Link>
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
            Create account
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal mb-2">
            Join Cyprus Winter
          </h1>
          <p className="text-olive/80 text-base leading-relaxed mb-8">
            Your plan and bookings follow you across devices.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {error && (
              <div role="alert" className={`p-4 rounded-xl border text-sm ${isAlreadyRegistered ? "bg-aegean/5 border-aegean/30 text-olive" : "bg-terracotta/5 border-terracotta/20 text-olive"}`}>
                <p>{error}</p>
                {isAlreadyRegistered && (
                  <Link href="/login" className={`mt-3 inline-flex font-medium min-h-[44px] items-center py-2 text-aegean hover:text-aegean/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aegean/50 rounded`}>
                    Sign in instead →
                  </Link>
                )}
              </div>
            )}

            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-olive mb-2">
                Name <span className="text-olive/50">(optional)</span>
              </label>
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className={inputBase}
                placeholder="Your name"
                disabled={loading || isLoading}
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-olive mb-2">
                Email
              </label>
              <input
                ref={emailRef}
                id="reg-email"
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

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-olive mb-2">
                Password
              </label>
              <p id="reg-password-hint" className="text-xs text-olive/60 mb-1.5">At least 6 characters</p>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className={`${inputBase} pr-12`}
                  placeholder="••••••••"
                  disabled={loading || isLoading}
                  aria-describedby="reg-password-hint"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-olive/60 hover:text-olive transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-olive mb-2">
                Confirm password
              </label>
              <input
                id="reg-confirm"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={inputBase}
                placeholder="••••••••"
                disabled={loading || isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || isLoading || !email.trim() || !password || !confirmPassword || password !== confirmPassword}
              className={`${CTA.primaryCompact} w-full min-h-[48px] pt-4 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-olive/70">
          Already have an account?{" "}
          <Link href="/login" className="text-terracotta font-medium hover:text-terracotta-muted transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
