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

  it("drops metadata fields that are not arrays", () => {
    const raw = `Some text\n\n---ACTIONS---\n{"cards":{"id":"omodos"},"actions":"open","followUps":"Plan a day"}`;
    const result = parseResponse(raw);
    expect(result.prose).toBe("Some text");
    expect(result.metadata).toBeUndefined();
  });

  it("keeps only well-formed metadata items", () => {
    const raw = `Some text\n\n---ACTIONS---\n{"cards":[{"type":"place","id":"omodos","title":"Omodos","reason":"Wine village"},{"type":"place","id":"bad"}],"actions":[{"type":"open_place","label":"See Omodos","payload":{"path":"/discover/omodos"}},{"type":"open_place"}],"followUps":["Plan a day",7]}`;
    const result = parseResponse(raw);
    expect(result.metadata?.cards).toEqual([
      { type: "place", id: "omodos", title: "Omodos", reason: "Wine village" },
    ]);
    expect(result.metadata?.actions).toEqual([
      { type: "open_place", label: "See Omodos", payload: { path: "/discover/omodos" } },
    ]);
    expect(result.metadata?.followUps).toEqual(["Plan a day"]);
  });

  it("drops action payload paths that are not safe internal paths", () => {
    const raw = `Some text\n\n---ACTIONS---\n{"actions":[{"type":"open_place","label":"External","payload":{"path":"https://evil.example"}},{"type":"open_place","label":"Protocol-relative","payload":{"path":"//evil.example"}},{"type":"open_place","label":"Safe","payload":{"path":"/discover/omodos"}}]}`;
    const result = parseResponse(raw);
    expect(result.metadata?.actions).toEqual([
      { type: "open_place", label: "Safe", payload: { path: "/discover/omodos" } },
    ]);
  });

  it("trims whitespace around prose and delimiter", () => {
    const raw = `  Trimmed text  \n\n---ACTIONS---\n{"cards":[],"actions":[],"followUps":[]}`;
    const result = parseResponse(raw);
    expect(result.prose).toBe("Trimmed text");
    expect(result.metadata).toBeUndefined();
  });
});
