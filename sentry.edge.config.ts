import * as Sentry from "@sentry/nextjs";
import { getSentryInitOptions } from "@/lib/sentry-init-options";

Sentry.init(getSentryInitOptions());
