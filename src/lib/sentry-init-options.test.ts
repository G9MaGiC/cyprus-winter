import { afterEach, describe, expect, it, vi } from "vitest";

describe("getSentryInitOptions", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("keeps debug off and tracesSampleRate at 0 in development by default", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SENTRY_DEBUG", "");
    vi.stubEnv("SENTRY_DSN", "");
    const { getSentryInitOptions } = await import("./sentry-init-options");
    const opts = getSentryInitOptions();
    expect(opts.debug).toBe(false);
    expect(opts.tracesSampleRate).toBe(0);
  });

  it("allows opt-in debug via SENTRY_DEBUG=1", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SENTRY_DEBUG", "1");
    const { getSentryInitOptions } = await import("./sentry-init-options");
    expect(getSentryInitOptions().debug).toBe(true);
  });

  it("uses production sample rate in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SENTRY_DEBUG", "");
    const { getSentryInitOptions } = await import("./sentry-init-options");
    expect(getSentryInitOptions().tracesSampleRate).toBe(0.1);
    expect(getSentryInitOptions().debug).toBe(false);
  });
});
