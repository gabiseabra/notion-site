export function uuidEquals(a: string, b: string) {
  return normalizeUuid(a) === normalizeUuid(b);
}

export function normalizeUuid(uuid: string) {
  return uuid.replace(/-/g, "");
}
