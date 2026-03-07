import { describe, it, expect } from "vitest";
import { chatRequestSchema } from "./chat-schema";

describe("chatRequestSchema", () => {
  it("accepts valid messages array", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "user", content: "Hello" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty messages", () => {
    const result = chatRequestSchema.safeParse({ messages: [] });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "invalid", content: "Hi" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty content", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "user", content: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts content exactly 10000 chars", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "user", content: "x".repeat(10000) }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects content over 10000 chars", () => {
    const result = chatRequestSchema.safeParse({
      messages: [{ role: "user", content: "x".repeat(10001) }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts assistant and system roles", () => {
    const result = chatRequestSchema.safeParse({
      messages: [
        { role: "user", content: "Hi" },
        { role: "assistant", content: "Hello!" },
        { role: "system", content: "You are helpful." },
      ],
    });
    expect(result.success).toBe(true);
  });
});
