"use client";

import { useEffect, useRef } from "react";

const SERVER_ENDPOINT = "http://127.0.0.1:7628/ingest/80b5b3b1-6619-475c-a7bb-fb3080a9d865";
const SESSION_ID = "ce8533";
const DEBUG_ENABLED = process.env.NODE_ENV !== "production";

export default function DebugErrorReporter() {
  const capsRef = useRef({ onerror: 0, unhandledrejection: 0, fetchNonOk: 0, fetchNetwork: 0 });

  useEffect(() => {
    if (!DEBUG_ENABLED) return;

    // Capture uncaught JS errors / promise rejections and failed fetch responses.
    const onError: OnErrorEventHandler = (event) => {
      if (capsRef.current.onerror >= 2) return;
      capsRef.current.onerror += 1;

      const ev = typeof event === "string" ? null : (event as any);

      // #region debug log: uncaught JS error
      fetch(SERVER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": SESSION_ID },
        body: JSON.stringify({
          sessionId: SESSION_ID,
          runId: "recheck_initial",
          hypothesisId: "A_uncaught_error",
          location: "src/components/DebugErrorReporter.tsx:onerror",
          message: "Uncaught JS error",
          data: {
            message: ev?.message ?? "",
            filename: ev?.filename ?? "",
            lineno: ev?.lineno ?? "",
            colno: ev?.colno ?? "",
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (capsRef.current.unhandledrejection >= 2) return;
      capsRef.current.unhandledrejection += 1;

      const reason = event?.reason;
      const message = reason instanceof Error ? reason.message : String(reason ?? "");
      const name = reason instanceof Error ? reason.name : "";

      // #region debug log: unhandled promise rejection
      fetch(SERVER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": SESSION_ID },
        body: JSON.stringify({
          sessionId: SESSION_ID,
          runId: "recheck_initial",
          hypothesisId: "B_unhandled_rejection",
          location: "src/components/DebugErrorReporter.tsx:onunhandledrejection",
          message: "Unhandled promise rejection",
          data: {
            message,
            name,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    };

    // Wrap fetch to capture non-OK responses and network failures.
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const res = await originalFetch(input, init);

        // Capture a few non-OK responses to test fetch-failure hypothesis.
        if (!res.ok) {
          if (capsRef.current.fetchNonOk < 3) {
            capsRef.current.fetchNonOk += 1;

            const urlStr =
              typeof input === "string"
                ? input
                : input instanceof URL
                  ? input.toString()
                  : input instanceof Request
                    ? input.url
                    : "";

            let path = urlStr;
            try {
              const u = new URL(urlStr, window.location.origin);
              path = u.pathname;
            } catch {
              // Keep raw string if URL parsing fails.
            }

            // #region debug log: fetch non-OK response
            fetch(SERVER_ENDPOINT, {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Debug-Session-Id": SESSION_ID },
              body: JSON.stringify({
                sessionId: SESSION_ID,
                runId: "recheck_initial",
                hypothesisId: "C_fetch_non_ok",
                location: "src/components/DebugErrorReporter.tsx:fetch_non_ok",
                message: "Fetch returned non-OK",
                data: {
                  status: res.status,
                  ok: res.ok,
                  method: (init?.method ?? (input instanceof Request ? input.method : undefined)) ?? "",
                  path,
                },
                timestamp: Date.now(),
              }),
            }).catch(() => {});
            // #endregion
          }
        }

        return res;
      } catch (err) {
        if (capsRef.current.fetchNetwork < 3) {
          capsRef.current.fetchNetwork += 1;

          const urlStr =
            typeof input === "string"
              ? input
              : input instanceof URL
                ? input.toString()
                : input instanceof Request
                  ? input.url
                  : "";
          let path = urlStr;
          try {
            const u = new URL(urlStr, window.location.origin);
            path = u.pathname;
          } catch {
            // Keep raw string if URL parsing fails.
          }

          const message = err instanceof Error ? err.message : String(err ?? "");

          // #region debug log: fetch network error
          fetch(SERVER_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Debug-Session-Id": SESSION_ID },
            body: JSON.stringify({
              sessionId: SESSION_ID,
              runId: "recheck_initial",
              hypothesisId: "C_fetch_network_error",
              location: "src/components/DebugErrorReporter.tsx:fetch_network_error",
              message: "Fetch threw (network error)",
              data: {
                message,
                path,
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
        }

        throw err;
      }
    };

    window.addEventListener("error", onError as unknown as EventListener);
    window.addEventListener("unhandledrejection", onUnhandledRejection as unknown as EventListener);

    return () => {
      window.removeEventListener("error", onError as unknown as EventListener);
      window.removeEventListener("unhandledrejection", onUnhandledRejection as unknown as EventListener);
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}

