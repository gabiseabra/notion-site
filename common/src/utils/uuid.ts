export function uuidEquals(a: string, b: string) {
  return normalizeUuid(a) === normalizeUuid(b);
}

export function normalizeUuid(uuid: string) {
  return uuid.replace(/-/g, "").toLowerCase();
}

export function isUuid(uuid: string) {
  return /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(
    uuid,
  );
}
