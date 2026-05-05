"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import AuthPasswordInput from "@/components/auth/AuthPasswordInput";
import AuthErrorAlert from "@/components/auth/AuthErrorAlert";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import { CTA, SECTION } from "@/lib/design-tokens";
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
        kicker="Create account"
        title="Create account"
        subtitle="Auth is being set up. You can still use the app—your plan saves on this device. Check back soon."
        backHref="/account"
        backLabel="Back to account"
      >
        <Link href="/account" className={CTA.primaryCompact}>
          Back to account
        </Link>
      </AuthLayout>
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
      <AuthLayout
        variant="success"
        kicker="Check your email"
        title="Almost there"
        subtitle={
          <>
            We sent a confirmation link to <strong className="text-charcoal">{email}</strong>. Click it to activate your account, then sign in.
          </>
        }
        backHref="/"
        backLabel="Back to home"
      >
        <Link href="/login" className={CTA.primaryCompact}>
          Sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      variant="register"
      kicker="Create account"
      title="Join Cyprus Winter"
      subtitle="Plan trails, wineries, villages. Sync your itinerary across devices."
      backHref="/account"
      backLabel="Back to account"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-terracotta font-medium hover:text-terracotta-muted transition-colors"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {error && (
          <AuthErrorAlert message={error} variant={isAlreadyRegistered ? "aegean" : "terracotta"}>
            {isAlreadyRegistered && (
              <Link href="/login" className={SECTION.aegeanLink}>
                Sign in instead →
              </Link>
            )}
          </AuthErrorAlert>
        )}

        <AuthInput
          id="reg-name"
          label="Name (optional)"
          type="text"
          value={name}
          onChange={setName}
          placeholder="Your name"
          disabled={loading || isLoading}
          autoComplete="name"
        />

        <AuthInput
          ref={emailRef}
          id="reg-email"
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

        <AuthPasswordInput
          id="reg-password"
          label="Password"
          hint="At least 6 characters"
          showStrength
          value={password}
          onChange={setPassword}
          disabled={loading || isLoading}
          required
          autoComplete="new-password"
        />

        <AuthPasswordInput
          id="reg-confirm"
          label="Confirm password"
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
          {loading ? "Creating account…" : "Create account"}
        </button>

        <SocialLoginButtons intent="signup" />
      </form>
    </AuthLayout>
  );
}
