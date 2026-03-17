import * as Sentry from "@sentry/nextjs";
import { sentryBeforeSend } from "@/lib/sentry-redact";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === "development",
  beforeSend: sentryBeforeSend,
});
