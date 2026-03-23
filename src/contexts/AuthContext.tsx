"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const debugCapsRef = useRef({
    config: 0,
    sessionStart: 0,
    sessionResolved: 0,
    sessionRejected: 0,
    authStateChange: 0,
  });

  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isConfigured: isConfigured(),
  });

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      if (debugCapsRef.current.config < 2) {
        debugCapsRef.current.config += 1;
        // #region debug log: auth not configured
        fetch("http://127.0.0.1:7628/ingest/80b5b3b1-6619-475c-a7bb-fb3080a9d865", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ce8533" },
          body: JSON.stringify({
            sessionId: "ce8533",
            runId: "recheck_initial",
            hypothesisId: "H2_auth_init_unavailable",
            location: "src/contexts/AuthContext.tsx:useEffect:no_supabase",
            message: "getSupabaseBrowser returned null",
            data: {
              hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
              hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
      }

      queueMicrotask(() =>
        setState((s) => ({ ...s, isLoading: false, isConfigured: false }))
      );
      return;
    }

    let mounted = true;

    if (debugCapsRef.current.sessionStart < 2) {
      debugCapsRef.current.sessionStart += 1;
      // #region debug log: auth getSession start
      fetch("http://127.0.0.1:7628/ingest/80b5b3b1-6619-475c-a7bb-fb3080a9d865", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ce8533" },
        body: JSON.stringify({
          sessionId: "ce8533",
          runId: "recheck_initial",
          hypothesisId: "H2_auth_get_session_start",
          location: "src/contexts/AuthContext.tsx:useEffect:getSession_start",
          message: "Calling supabase.auth.getSession",
          data: { mounted: true },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (debugCapsRef.current.sessionResolved < 2) {
        debugCapsRef.current.sessionResolved += 1;
        // #region debug log: auth getSession resolved
        fetch("http://127.0.0.1:7628/ingest/80b5b3b1-6619-475c-a7bb-fb3080a9d865", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ce8533" },
          body: JSON.stringify({
            sessionId: "ce8533",
            runId: "recheck_initial",
            hypothesisId: "H2_auth_get_session_resolved",
            location: "src/contexts/AuthContext.tsx:useEffect:getSession_resolved",
            message: "supabase.auth.getSession resolved",
            data: {
              mounted,
              hasSession: Boolean(session),
              hasUser: Boolean(session?.user),
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
      }
      if (!mounted) return;
      setState((s) => ({
        ...s,
        user: session?.user ?? null,
        session,
        isLoading: false,
      }));
    }).catch((error: unknown) => {
      if (debugCapsRef.current.sessionRejected < 2) {
        debugCapsRef.current.sessionRejected += 1;
        const message = error instanceof Error ? error.message : String(error ?? "");
        // #region debug log: auth getSession rejected
        fetch("http://127.0.0.1:7628/ingest/80b5b3b1-6619-475c-a7bb-fb3080a9d865", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ce8533" },
          body: JSON.stringify({
            sessionId: "ce8533",
            runId: "recheck_initial",
            hypothesisId: "H2_auth_get_session_rejected",
            location: "src/contexts/AuthContext.tsx:useEffect:getSession_rejected",
            message: "supabase.auth.getSession rejected",
            data: { message },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (debugCapsRef.current.authStateChange < 3) {
        debugCapsRef.current.authStateChange += 1;
        // #region debug log: auth state change
        fetch("http://127.0.0.1:7628/ingest/80b5b3b1-6619-475c-a7bb-fb3080a9d865", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ce8533" },
          body: JSON.stringify({
            sessionId: "ce8533",
            runId: "recheck_initial",
            hypothesisId: "H2_auth_state_change",
            location: "src/contexts/AuthContext.tsx:onAuthStateChange",
            message: "Supabase auth state changed",
            data: {
              event,
              hasSession: Boolean(session),
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
      }
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
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/account" : undefined },
    });
    return { error: error?.message ?? null };
  }, []);

  const signInWithOAuth = useCallback(async (provider: OAuthProvider, redirectTo?: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return { error: "Auth is not configured." };
    const to = redirectTo ?? (typeof window !== "undefined" ? window.location.origin + "/account" : undefined);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: to ? { redirectTo: to } : undefined,
    });
    if (error) return { error: error.message };
    if (data?.url) window.location.href = data.url;
    return { error: null };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return { error: "Auth is not configured." };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: typeof window !== "undefined" ? window.location.origin + "/reset-password" : undefined,
    });
    return { error: error?.message ?? null };
  }, []);

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
