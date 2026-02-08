export type NonEmpty<T> = [T, ...T[]];

export const NonEmpty = {
  create<T>(t: T, ...ts: T[]): NonEmpty<T> {
    return [t, ...ts];
  },

  merge<T>([t, ...ts]: NonEmpty<T>, ...tss: T[][]): NonEmpty<T> {
    return [t, ...ts, ...tss.flat(1)];
  },

  isNonEmpty<T>(arr: T[]): arr is NonEmpty<T> {
    return arr.length > 0;
  },

  extract<T>([t]: NonEmpty<T>): T {
    return t;
  },
};
