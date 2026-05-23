/**
 * Validate internal app paths for AI actions and chat metadata.
 * Rejects protocol URLs, protocol-relative paths, and unknown routes.
 */
const ALLOWED_PREFIXES = [
  "/",
  "/discover",
  "/trails",
  "/plan",
  "/book",
  "/bookings",
  "/search",
  "/events",
  "/weather",
  "/airport",
  "/wineries",
  "/villages",
  "/beaches",
  "/secrets",
  "/regions",
  "/wine-routes",
] as const;

export function isSafeInternalPath(path: string): boolean {
  if (!path || typeof path !== "string") return false;
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return false;
  if (trimmed.includes("..")) return false;
  const base = trimmed.split("?")[0]?.split("#")[0] ?? trimmed;
  return ALLOWED_PREFIXES.some(
    (prefix) => base === prefix || base.startsWith(`${prefix}/`)
  );
}
