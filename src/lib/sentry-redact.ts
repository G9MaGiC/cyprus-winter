function redactHeaders(headers: Record<string, unknown>) {
  for (const key of Object.keys(headers)) {
    const lower = key.toLowerCase();
    if (lower === "authorization" || lower === "cookie" || lower === "set-cookie") {
      delete headers[key];
    }
  }
}

import type { ErrorEvent, EventHint } from "@sentry/nextjs";

export function sentryBeforeSend(event: ErrorEvent, hint?: EventHint): ErrorEvent | null {
  void hint;
  const headers = event.request?.headers;
  if (headers && typeof headers === "object") {
    redactHeaders(headers as Record<string, unknown>);
  }

  // Sentry can capture cookies as a separate field depending on integration.
  if (event.request && "cookies" in event.request) {
    delete (event.request as { cookies?: unknown }).cookies;
  }

  return event;
}

