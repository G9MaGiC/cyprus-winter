"use client";

import type { ReactNode } from "react";

export type AuthErrorAlertProps = {
  message: string;
  variant?: "terracotta" | "aegean";
  children?: ReactNode;
};

const base =
  "p-4 rounded-xl border text-sm text-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/40 focus-visible:ring-offset-2";

export default function AuthErrorAlert({
  message,
  variant = "terracotta",
  children,
}: AuthErrorAlertProps) {
  const classes =
    variant === "aegean"
      ? `${base} bg-aegean/5 border-aegean/30`
      : `${base} bg-terracotta/5 border-terracotta/20`;

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic
      className={classes}
    >
      <p>{message}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
