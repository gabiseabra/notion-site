export type Slot<T, S = void, Args extends unknown[] = []> =
  | T
  | ((value: S, ...args: Args) => T);

export const Slot = {
  extract<T, S, Args extends unknown[]>(
    slot: Slot<T, S, Args>,
    value: S,
    ...args: Args
  ) {
    if (slot instanceof Function) return slot(value, ...args);
    return slot;
  },

  map<A, B, S, Args extends unknown[]>(
    slot: Slot<A, S, Args>,
    f: (a: A) => B,
  ): Slot<B, S, Args> {
    return (s, ...args) => f(Slot.extract(slot, s, ...args));
  },
};
