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
