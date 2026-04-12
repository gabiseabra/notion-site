export type NonEmpty<T> = [T, ...T[]];

export const NonEmpty = {
  create<T>(t: T, ...ts: T[]): NonEmpty<T> {
    return [t, ...ts];
  },

  append<T>([t, ...ts]: NonEmpty<T>, ...tss: T[]): NonEmpty<T> {
    return [t, ...ts, ...tss];
  },

  merge<T>([ts, ...tss]: NonEmpty<T>[]): NonEmpty<T> {
    return NonEmpty.append(ts, ...tss.flatMap(NonEmpty.toArray));
  },

  isNonEmpty<T>(arr: T[]): arr is NonEmpty<T> {
    return arr.length > 0;
  },

  extract<T>([t]: NonEmpty<T>): T {
    return t;
  },

  toArray<T>(t: NonEmpty<T>): T[] {
    return [...t];
  },
};
