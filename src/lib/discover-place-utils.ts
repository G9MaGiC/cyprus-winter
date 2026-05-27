/** Cultural notes that reference the buffer zone use a dedicated warning UI. */
export function isBufferZoneCulturalNote(note: string | undefined): boolean {
  if (!note) return false;
  return /buffer zone/i.test(note);
}
