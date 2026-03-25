export function shuffle<T>(array: T[]) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

export function mapFind<A, B>(
  as: A[],
  map: (a: A) => B | undefined,
): B | undefined {
  for (let i = 0; i < as.length; ++i) {
    const value = as[i] && map(as[i]);
    if (value) return value;
  }
}

export function mapFindLast<A, B>(
  as: A[],
  map: (a: A) => B | undefined,
): B | undefined {
  for (let i = as.length - 1; i >= 0; --i) {
    const value = as[i] && map(as[i]);
    if (value) return value;
  }
}
