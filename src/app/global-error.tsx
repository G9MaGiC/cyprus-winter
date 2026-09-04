"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect, type CSSProperties } from "react";
import { BRAND_COLORS } from "@/lib/brand-colors";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const bodyStyle: CSSProperties = {
  margin: 0,
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "24px",
  boxSizing: "border-box",
  background: BRAND_COLORS.cloud,
  color: BRAND_COLORS.charcoal,
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
};

const cardStyle: CSSProperties = {
  width: "min(100%, 560px)",
  padding: "32px",
  border: `1px solid ${BRAND_COLORS.sandDark}`,
  borderRadius: "20px",
  background: "#ffffff",
  boxShadow: "0 16px 44px rgba(37, 39, 48, 0.12)",
  textAlign: "center",
};

const actionsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "12px",
  marginTop: "24px",
};

const actionStyle: CSSProperties = {
  minHeight: "44px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 18px",
  borderRadius: "999px",
  border: 0,
  font: "inherit",
  fontWeight: 700,
  cursor: "pointer",
  textDecoration: "none",
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={bodyStyle}>
        <main role="alert" style={cardStyle}>
          <p style={{ margin: "0 0 8px", color: BRAND_COLORS.terracotta, fontWeight: 700 }}>
            Cyprus Winter
          </p>
          <h1 style={{ margin: 0, fontSize: "clamp(1.75rem, 6vw, 2.5rem)" }}>
            We could not load this page
          </h1>
          <p style={{ margin: "16px 0 0", color: BRAND_COLORS.olive, lineHeight: 1.6 }}>
            A temporary error interrupted the app. Try again, or return to the home page.
          </p>
          <div style={actionsStyle}>
            <button
              type="button"
              onClick={reset}
              style={{ ...actionStyle, background: BRAND_COLORS.terracotta, color: "#ffffff" }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                ...actionStyle,
                border: `1px solid ${BRAND_COLORS.aegean}`,
                background: "#ffffff",
                color: BRAND_COLORS.aegean,
              }}
            >
              Go home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
