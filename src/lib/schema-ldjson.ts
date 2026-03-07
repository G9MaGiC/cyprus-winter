/**
 * LD+JSON schema helpers — trust boundary.
 *
 * All schema fields MUST come from trusted static data (src/data/).
 * Never pass user input or unsanitized content to schemaForLdJson.
 * JSON.stringify escapes quotes and angle brackets; safe for script injection
 * when content is from our own data files.
 */
export function schemaForLdJson<T extends object>(schema: T): string {
  return JSON.stringify(schema);
}
