"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { localizedPathname } from "@/lib/seo-locale-urls";
import type { User, Session } from "@supabase/supabase-js";

type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  needsPasswordReset?: boolean;
};

export type OAuthProvider = "google" | "apple";

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  signInWithOtp: (email: string) => Promise<{ error: string | null }>;
  signInWithOAuth: (provider: OAuthProvider, redirectTo?: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isConfigured(): boolean {
  return !!(
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function absoluteAppUrl(path: string, locale: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${localizedPathname(path, locale)}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isConfigured: isConfigured(),
  });

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      queueMicrotask(() =>
        setState((s) => ({ ...s, isLoading: false, isConfigured: false }))
      );
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setState((s) => ({
        ...s,
        user: session?.user ?? null,
        session,
        isLoading: false,
      }));
    }).catch(() => {});

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      setState((s) => ({
        ...s,
        user: session?.user ?? null,
        session,
        needsPasswordReset: event === "PASSWORD_RECOVERY" || undefined,
      }));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return { error: "Auth is not configured." };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return { error: "Auth is not configured." };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: name ? { data: { full_name: name } } : undefined,
    });
    return { error: error?.message ?? null };
  }, []);

  const signInWithOtp = useCallback(async (email: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return { error: "Auth is not configured." };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: absoluteAppUrl("/account", locale) },
    });
    return { error: error?.message ?? null };
  }, [locale]);

  const signInWithOAuth = useCallback(async (provider: OAuthProvider, redirectTo?: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return { error: "Auth is not configured." };
    const to = redirectTo ?? absoluteAppUrl("/account", locale);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: to ? { redirectTo: to } : undefined,
    });
    if (error) return { error: error.message };
    if (data?.url) window.location.href = data.url;
    return { error: null };
  }, [locale]);

  const resetPassword = useCallback(async (email: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return { error: "Auth is not configured." };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: absoluteAppUrl("/reset-password", locale),
    });
    return { error: error?.message ?? null };
  }, [locale]);

  const updatePassword = useCallback(async (password: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return { error: "Auth is not configured." };
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (supabase) await supabase.auth.signOut();
  }, []);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    signInWithOtp,
    signInWithOAuth,
    resetPassword,
    updatePassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
