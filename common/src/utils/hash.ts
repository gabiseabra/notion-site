/**
 * Deterministically stringifies a JSON value by sorting object keys at every level.
 * Arrays keep their order. Throws on circular structures (same as JSON.stringify).
 */
export function hash(value: unknown) {
  return JSON.stringify(value, (k, v) => {
    if (!v || typeof v !== "object" || Array.isArray(v)) return v;
    return Object.fromEntries(
      Object.entries(v).sort(([a], [b]) => a.localeCompare(b)),
    );
  });
}
