import { describe, it, expect } from "vitest";

function isCapableProvider(provider: { model: string; isOllama?: boolean }): boolean {
  const weakModels = ["llama-3.1-8b-instant", "llama3.2", "moonshot-v1-8k"];
  return !weakModels.includes(provider.model) && !provider.isOllama;
}

describe("isCapableProvider", () => {
  it("marks grok-3-mini as capable", () => {
    expect(isCapableProvider({ model: "grok-3-mini" })).toBe(true);
  });
  it("marks gpt-4o-mini as capable", () => {
    expect(isCapableProvider({ model: "gpt-4o-mini" })).toBe(true);
  });
  it("marks llama-3.1-8b-instant as not capable", () => {
    expect(isCapableProvider({ model: "llama-3.1-8b-instant" })).toBe(false);
  });
  it("marks ollama provider as not capable", () => {
    expect(isCapableProvider({ model: "llama3.2", isOllama: true })).toBe(false);
  });
  it("marks moonshot as not capable", () => {
    expect(isCapableProvider({ model: "moonshot-v1-8k" })).toBe(false);
  });
});
