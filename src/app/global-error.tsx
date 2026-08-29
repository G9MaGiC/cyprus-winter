"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, type CSSProperties } from "react";

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
  background: "#faf8f5",
  color: "#252730",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
};

const cardStyle: CSSProperties = {
  width: "min(100%, 560px)",
  padding: "32px",
  border: "1px solid #eae6df",
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
          <p style={{ margin: "0 0 8px", color: "#c96f52", fontWeight: 700 }}>
            Cyprus Winter
          </p>
          <h1 style={{ margin: 0, fontSize: "clamp(1.75rem, 6vw, 2.5rem)" }}>
            We could not load this page
          </h1>
          <p style={{ margin: "16px 0 0", color: "#4a5162", lineHeight: 1.6 }}>
            A temporary error interrupted the app. Try again, or return to the home page.
          </p>
          <div style={actionsStyle}>
            <button
              type="button"
              onClick={reset}
              style={{ ...actionStyle, background: "#c96f52", color: "#ffffff" }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                ...actionStyle,
                border: "1px solid #1a6b7c",
                background: "#ffffff",
                color: "#1a6b7c",
              }}
            >
              Go home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
