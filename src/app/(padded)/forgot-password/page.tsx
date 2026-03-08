"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import { LAYOUT, CARD, CTA } from "@/lib/design-tokens";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPasswordPage() {
  const { resetPassword, isConfigured } = useAuth();
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
      <div className="min-h-[60vh] bg-gradient-to-b from-sand-100/60 to-background">
        <div className={`${LAYOUT.formNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
          <BackLink href="/login" label="Back to sign in" />
          <div className={`${CARD.base} ${CARD.contentLg} mt-10 border-l-4 border-l-terracotta/50`}>
            <h1 className="font-display text-xl font-semibold text-charcoal mb-2">Reset password</h1>
            <p className="text-olive/80 text-sm leading-relaxed mb-6">Auth is being set up. Contact support if you need help.</p>
            <Link href="/login" className={CTA.primaryCompact}>
              Back to sign in
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
      const { error: err } = await resetPassword(email.trim());
      if (err) setError(err.includes("valid") ? "Please enter a valid email address." : err);
      else setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-sand-100/60 to-background">
        <div className={`${LAYOUT.formNarrow} mx-auto ${LAYOUT.safeAreaX} ${LAYOUT.pagePy}`}>
          <BackLink href="/login" label="Back to sign in" />
          <div className={`${CARD.base} ${CARD.contentLg} mt-10 border-l-4 border-l-aegean/50`}>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-aegean mb-2">Check your email</p>
            <h1 className="font-display text-2xl font-bold text-charcoal mb-2">Reset link sent</h1>
            <p className="text-olive/80 text-base leading-relaxed mb-6">
              We sent a password reset link to <strong className="text-charcoal">{email}</strong>. Click it to set a new password.
            </p>
            <Link href="/login" className={CTA.primaryCompact}>
              Back to sign in
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
        <BackLink href="/login" label="Back to sign in" />

        <div className={`${CARD.base} ${CARD.contentLg} mt-10 sm:mt-14 border-l-4 border-l-terracotta/50 shadow-md`}>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-terracotta/90 mb-2">Reset password</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal mb-2">Forgot your password?</h1>
          <p className="text-olive/70 text-base leading-relaxed mb-8">
            Enter your email and we&apos;ll send you a link to set a new password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {error && (
              <div role="alert" className="p-4 rounded-xl bg-terracotta/5 border border-terracotta/20 text-sm text-olive">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium text-olive mb-2">Email</label>
              <input
                ref={emailRef}
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputBase}
                placeholder="you@example.com"
                disabled={loading}
                autoCapitalize="none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className={`${CTA.primaryCompact} w-full min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-olive/70">
          <Link href="/login" className="text-terracotta font-medium hover:text-terracotta-muted transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
