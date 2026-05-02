import { describe, it, expect } from "vitest";
import { parseResponse } from "../response-parser";

describe("parseResponse", () => {
  it("splits prose from JSON on ---ACTIONS--- delimiter", () => {
    const raw = `Here are 3 villages near Paphos.

---ACTIONS---
{"cards":[{"type":"place","id":"kathikas","title":"Kathikas","reason":"Wine village"}],"actions":[{"type":"open_place","label":"See Kathikas"}],"followUps":["Add a winery"]}`;

    const result = parseResponse(raw);
    expect(result.prose).toBe("Here are 3 villages near Paphos.");
    expect(result.metadata?.cards).toHaveLength(1);
    expect(result.metadata?.cards?.[0].id).toBe("kathikas");
    expect(result.metadata?.actions).toHaveLength(1);
    expect(result.metadata?.followUps).toHaveLength(1);
  });

  it("returns prose-only when no delimiter present", () => {
    const raw = "Just a plain text response.";
    const result = parseResponse(raw);
    expect(result.prose).toBe("Just a plain text response.");
    expect(result.metadata).toBeUndefined();
  });

  it("handles malformed JSON gracefully", () => {
    const raw = `Some text\n\n---ACTIONS---\n{invalid json}`;
    const result = parseResponse(raw);
    expect(result.prose).toBe("Some text");
    expect(result.metadata).toBeUndefined();
  });

  it("drops malformed metadata fields instead of returning unsafe shapes", () => {
    const raw = `Some text

---ACTIONS---
{"cards":"not-an-array","actions":[{"type":"open_place","label":"Open","payload":{"path":"/discover/kathikas"}}],"followUps":"not-an-array"}`;
    const result = parseResponse(raw);

    expect(result.prose).toBe("Some text");
    expect(result.metadata?.cards).toBeUndefined();
    expect(result.metadata?.actions).toHaveLength(1);
    expect(result.metadata?.followUps).toBeUndefined();
  });

  it("returns prose-only when all metadata fields have invalid shapes", () => {
    const raw = `Some text

---ACTIONS---
{"cards":{"id":"kathikas"},"actions":[{"type":"open_place"}],"followUps":[42]}`;
    const result = parseResponse(raw);

    expect(result.prose).toBe("Some text");
    expect(result.metadata).toBeUndefined();
  });

  it("trims whitespace around prose and delimiter", () => {
    const raw = `  Trimmed text  \n\n---ACTIONS---\n{"cards":[],"actions":[],"followUps":[]}`;
    const result = parseResponse(raw);
    expect(result.prose).toBe("Trimmed text");
    expect(result.metadata).toBeUndefined();
  });
});
