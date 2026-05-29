/** Join aria-describedby ids for visible hints + error messages (WCAG 3.3). */
export function fieldDescribedBy(...ids: Array<string | false | null | undefined>): string | undefined {
  const joined = ids.filter((id): id is string => Boolean(id)).join(" ");
  return joined.length > 0 ? joined : undefined;
}
