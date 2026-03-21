import { describe, it, expect } from "vitest";
import {
  LAST_PLACE_KEY,
  CHAT_SESSION_KEY,
  ONBOARDING_KEY,
  INTENT_KEY,
  ONBOARDING_TIP_PLAN_EMPTY,
  ONBOARDING_TIP_DISCOVER_FILTER,
  ONBOARDING_TIP_FIRST_ADD,
} from "./local-storage-keys";

describe("local-storage-keys", () => {
  it("exports LAST_PLACE_KEY as a non-empty string", () => {
    expect(typeof LAST_PLACE_KEY).toBe("string");
    expect(LAST_PLACE_KEY.length).toBeGreaterThan(0);
    expect(LAST_PLACE_KEY).toBe("cyprus-last-place");
  });

  it("exports CHAT_SESSION_KEY as a non-empty string", () => {
    expect(CHAT_SESSION_KEY).toBe("cyprus-ai-chat-session");
  });

  it("exports ONBOARDING_KEY as a non-empty string", () => {
    expect(ONBOARDING_KEY).toBe("cyprus-winter-onboarded");
  });

  it("exports INTENT_KEY as a non-empty string", () => {
    expect(INTENT_KEY).toBe("cyprus-winter-intent");
  });

  it("exports onboarding tip keys", () => {
    expect(ONBOARDING_TIP_PLAN_EMPTY).toBe("cyprus-winter-tip-plan-empty");
    expect(ONBOARDING_TIP_DISCOVER_FILTER).toBe("cyprus-winter-tip-discover-filter");
    expect(ONBOARDING_TIP_FIRST_ADD).toBe("cyprus-winter-tip-first-add");
  });

  it("all keys are unique", () => {
    const keys = [
      LAST_PLACE_KEY,
      CHAT_SESSION_KEY,
      ONBOARDING_KEY,
      INTENT_KEY,
      ONBOARDING_TIP_PLAN_EMPTY,
      ONBOARDING_TIP_DISCOVER_FILTER,
      ONBOARDING_TIP_FIRST_ADD,
    ];
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });

  it("all keys start with cyprus- prefix", () => {
    const keys = [
      LAST_PLACE_KEY,
      CHAT_SESSION_KEY,
      ONBOARDING_KEY,
      INTENT_KEY,
      ONBOARDING_TIP_PLAN_EMPTY,
      ONBOARDING_TIP_DISCOVER_FILTER,
      ONBOARDING_TIP_FIRST_ADD,
    ];
    for (const key of keys) {
      expect(key).toMatch(/^cyprus-/);
    }
  });
});
