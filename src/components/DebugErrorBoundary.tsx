"use client";

import React from "react";

const SERVER_ENDPOINT = "http://127.0.0.1:7628/ingest/80b5b3b1-6619-475c-a7bb-fb3080a9d865";
const SESSION_ID = "ce8533";
const DEBUG_ENABLED = process.env.NODE_ENV !== "production";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export default class DebugErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (!DEBUG_ENABLED) return;
    // #region debug log: react error boundary
    fetch(SERVER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": SESSION_ID },
      body: JSON.stringify({
        sessionId: SESSION_ID,
        runId: "recheck_initial",
        hypothesisId: "A_render_commit_exception",
        location: "src/components/DebugErrorBoundary.tsx:componentDidCatch",
        message: "React error boundary captured exception",
        data: {
          errorName: error?.name ?? "",
          errorMessage: error?.message ?? "",
          componentStack: info?.componentStack?.slice(0, 3000) ?? "",
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }

  render() {
    // Render children even after a caught error to avoid blanking the app.
    // We rely on the debug log capture above for diagnostics.
    return this.props.children;
  }
}

