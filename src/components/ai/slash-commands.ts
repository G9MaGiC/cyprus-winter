import type { Message } from "./hooks/useAIChat";

export type SlashCommandDef = {
  command: string;
  descriptionKey: "skillsDescription";
};

/** All registered slash commands, used for autocomplete UI. */
export const SLASH_COMMANDS: SlashCommandDef[] = [
  { command: "/skills", descriptionKey: "skillsDescription" },
];

/** Returns matching commands for the current input (used for autocomplete). */
export function matchSlashCommands(input: string): SlashCommandDef[] {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed.startsWith("/")) return [];
  return SLASH_COMMANDS.filter((c) => c.command.startsWith(trimmed));
}

export type SlashSkillsCopy = {
  content: string;
  followUps: string[];
};

/** Returns the assistant reply for a given slash command, or null if not a known command. */
export function handleSlashCommand(input: string, skills: SlashSkillsCopy): Message | null {
  const normalized = input.trim().toLowerCase();
  if (normalized === "/skills") {
    return {
      role: "assistant",
      content: skills.content,
      metadata: { followUps: skills.followUps },
    };
  }
  return null;
}

/** Returns true if the input is a slash command (starts with /). */
export function isSlashCommand(input: string): boolean {
  return input.trim().startsWith("/");
}
