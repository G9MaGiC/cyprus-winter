import type { BrowserOptions, NodeOptions } from "@sentry/nextjs";
import { sentryBeforeSend } from "@/lib/sentry-redact";

type SentrySharedOptions = Pick<
  BrowserOptions & NodeOptions,
  "dsn" | "environment" | "tracesSampleRate" | "debug" | "beforeSend"
>;

/**
 * Shared Sentry init options for browser/server/edge.
 * Keep `debug` off by default — enabling it in `next dev` floods the event loop
 * and has OOM'd the Node process (page looks like it "refreshes" every few seconds).
 * Opt in with `SENTRY_DEBUG=1`.
 */
export function getSentryInitOptions(): SentrySharedOptions {
  const isProd = process.env.NODE_ENV === "production";
  return {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: isProd ? 0.1 : 0,
    debug: process.env.SENTRY_DEBUG === "1",
    beforeSend: sentryBeforeSend,
  };
}
