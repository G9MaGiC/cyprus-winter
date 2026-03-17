export function toSafeJsonForScript(obj: unknown): string {
  // Prevent `</script>`-style breakouts when embedding JSON inside a <script> tag.
  // `JSON.stringify` doesn’t escape `<`, so we do.
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

