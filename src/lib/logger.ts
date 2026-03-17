/**
 * Structured logger for Cyprus Winter.
 * Disabled in production to reduce noise and improve performance.
 * In production, use Sentry or other error tracking instead.
 */

const isDev = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev && !isTest) {
      console.log("[Cyprus]", ...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (isDev && !isTest) {
      console.warn("[Cyprus]", ...args);
    }
  },

  error: (message: string, error?: unknown) => {
    // Always log errors, but in production use Sentry
    if (isDev || isTest) {
      console.error("[Cyprus]", message, error);
    } else {
      // In production, errors should be sent to Sentry
      // The Sentry integration will capture console.errors
      console.error(message, error);
    }
  },

  info: (...args: unknown[]) => {
    if (isDev && !isTest) {
      console.info("[Cyprus]", ...args);
    }
  },
};
