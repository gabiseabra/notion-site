export function normalizeTag(tag: string) {
  return tag.replace(/\s/g, " ").replace(/-/g, " ").toLowerCase();
}
