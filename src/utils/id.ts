let _counter = 0;

/** Generate a unique ID string for entities. */
export function generateId(): string {
  _counter++;
  return `id-${_counter}-${Math.random().toString(36).substr(2, 9)}`;
}

/** Format a numeric sequence number as a zero-padded 3-digit UID string. */
export function formatUid(n: number): string {
  return String(n).padStart(3, "0");
}
