export type NonEmptyArray<T> = [T, ...T[]];

export function isNonEmpty<T>(arr: T[]): arr is NonEmptyArray<T> {
  return arr.length > 0;
}
