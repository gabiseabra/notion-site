export type MaybeReadonly<T> = T extends readonly unknown[]
  ? T | readonly T[number][]
  : T | Readonly<T>;
