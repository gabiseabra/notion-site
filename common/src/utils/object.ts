export function omit<T extends object, const K extends readonly (keyof T)[]>(
  obj: T,
  keys: K,
): Omit<T, K[number]> {
  const out = { ...obj };

  for (const k of keys) {
    delete out[k];
  }

  return out;
}

export function omitUndefined<T>(object: Partial<T>): Partial<T> {
  const out: Partial<T> = {};

  for (const key in object) {
    if (typeof object[key] !== "undefined") {
      out[key] = object[key];
    }
  }

  return out;
}
