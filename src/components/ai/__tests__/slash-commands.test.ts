import { describe, it, expect } from "vitest";
import { handleSlashCommand, isSlashCommand, matchSlashCommands } from "../slash-commands";

const skills = {
  content: "Trip planning. Trails & hiking. Airport arrival.",
  followUps: ["Plan my 3-day trip"],
};

describe("handleSlashCommand", () => {
  it("returns a skills message for /skills", () => {
    const result = handleSlashCommand("/skills", skills);
    expect(result).not.toBeNull();
    expect(result?.role).toBe("assistant");
    expect(result?.content).toContain("Trip planning");
    expect(result?.content).toContain("Trails & hiking");
    expect(result?.content).toContain("Airport arrival");
  });

  it("is case-insensitive for /skills", () => {
    expect(handleSlashCommand("/SKILLS", skills)).not.toBeNull();
    expect(handleSlashCommand("/Skills", skills)).not.toBeNull();
  });

  it("trims whitespace before matching", () => {
    expect(handleSlashCommand("  /skills  ", skills)).not.toBeNull();
  });

  it("includes follow-up chips in metadata", () => {
    const result = handleSlashCommand("/skills", skills);
    expect(result?.metadata?.followUps?.length).toBeGreaterThan(0);
  });

  it("returns null for unknown commands", () => {
    expect(handleSlashCommand("/unknown", skills)).toBeNull();
    expect(handleSlashCommand("/help", skills)).toBeNull();
  });

  it("returns null for plain text", () => {
    expect(handleSlashCommand("what can you do?", skills)).toBeNull();
    expect(handleSlashCommand("skills", skills)).toBeNull();
  });
});

describe("isSlashCommand", () => {
  it("returns true for slash-prefixed input", () => {
    expect(isSlashCommand("/skills")).toBe(true);
    expect(isSlashCommand("/help")).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(isSlashCommand("skills")).toBe(false);
    expect(isSlashCommand("hello")).toBe(false);
  });

  it("handles leading whitespace", () => {
    expect(isSlashCommand("  /skills")).toBe(true);
  });
});

describe("matchSlashCommands", () => {
  it("returns all commands for bare /", () => {
    const matches = matchSlashCommands("/");
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((m) => m.command.startsWith("/"))).toBe(true);
  });

  it("filters to matching commands", () => {
    const matches = matchSlashCommands("/ski");
    expect(matches.some((m) => m.command === "/skills")).toBe(true);
  });

  it("returns exact match", () => {
    const matches = matchSlashCommands("/skills");
    expect(matches).toHaveLength(1);
    expect(matches[0].command).toBe("/skills");
    expect(matches[0].descriptionKey).toBe("skillsDescription");
  });

  it("returns empty for non-slash input", () => {
    expect(matchSlashCommands("skills")).toHaveLength(0);
    expect(matchSlashCommands("hello")).toHaveLength(0);
  });

  it("returns empty for non-matching slash input", () => {
    expect(matchSlashCommands("/xyz")).toHaveLength(0);
  });
});
