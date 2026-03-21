import { describe, it, expect } from "vitest";
import { sentryBeforeSend } from "./sentry-redact";
import type { ErrorEvent } from "@sentry/nextjs";

function makeEvent(overrides: Partial<ErrorEvent> = {}): ErrorEvent {
  return {
    event_id: "test-id",
    ...overrides,
  } as ErrorEvent;
}

describe("sentryBeforeSend", () => {
  it("returns the event (does not suppress)", () => {
    const event = makeEvent();
    expect(sentryBeforeSend(event)).toBe(event);
  });

  it("redacts authorization header", () => {
    const event = makeEvent({
      request: {
        url: "https://example.com",
        headers: { Authorization: "Bearer secret", "Content-Type": "application/json" },
      },
    });
    const result = sentryBeforeSend(event);
    expect(result!.request!.headers).not.toHaveProperty("Authorization");
    expect(result!.request!.headers).toHaveProperty("Content-Type");
  });

  it("redacts cookie header (case-insensitive key match)", () => {
    const event = makeEvent({
      request: {
        url: "https://example.com",
        headers: { cookie: "session=abc", Accept: "text/html" },
      },
    });
    const result = sentryBeforeSend(event);
    expect(result!.request!.headers).not.toHaveProperty("cookie");
    expect(result!.request!.headers).toHaveProperty("Accept");
  });

  it("redacts set-cookie header", () => {
    const event = makeEvent({
      request: {
        url: "https://example.com",
        headers: { "Set-Cookie": "token=xyz" },
      },
    });
    const result = sentryBeforeSend(event);
    expect(result!.request!.headers).not.toHaveProperty("Set-Cookie");
  });

  it("removes cookies field from request", () => {
    const event = makeEvent({
      request: {
        url: "https://example.com",
        headers: {},
        cookies: { session: "abc" },
      },
    }) as ErrorEvent;
    const result = sentryBeforeSend(event);
    expect("cookies" in (result!.request as Record<string, unknown>)).toBe(false);
  });

  it("handles event without request gracefully", () => {
    const event = makeEvent();
    expect(sentryBeforeSend(event)).toBe(event);
  });

  it("handles event with request but no headers", () => {
    const event = makeEvent({ request: { url: "https://example.com" } });
    expect(sentryBeforeSend(event)).toBe(event);
  });
});
